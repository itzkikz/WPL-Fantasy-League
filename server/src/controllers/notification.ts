import { NextFunction, Request, Response } from "express";
import { getSheets } from "../lib/store/globals";
import { convertToJSON } from "../utils";
import { Notifications } from "../types/users";
import jwt from 'jsonwebtoken'
import { sheets_v4 } from "googleapis";
import { Subscriber } from "../models/Subscriber";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { FantasyTeam } from "../models/FantasyTeam";
const webpush = require("web-push");
// Configure VAPID
const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:";
if (vapidPublic && vapidPrivate) {
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
} else {
    console.warn(
        "VAPID public/private keys are not set; push notifications will not be available."
    );
}


const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
type Cell = string | number | boolean | null;
type Row = Cell[];

export const subscribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscription = req.body.subscription;
        
        const user = await User.findOne({ username: req.user.userId });
        if (!user) {
            return res.status(404).json({ data: { message: "User not found" } });
        }
        const userId = user._id.toString();

        const existingSubscriber = await Subscriber.findOne({ endpoint: subscription.endpoint });

        if (existingSubscriber) {
            // Update userId in case a different user logs in on the same browser
            if (existingSubscriber.userId !== userId) {
                existingSubscriber.userId = userId;
                await existingSubscriber.save();
            }
            return res.status(200).json({ data: { message: "Already Subscribed" } })
        }

        await Subscriber.create({
            userId,
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime,
            keys: subscription.keys
        });
        
        res.json({ data: { message: "User Subscribed" } })

    } catch (e) {
        console.log(e)
        res.status(403).json({ data: { message: e } })
    }
}

export const send = async (req: Request, res: Response, next: NextFunction) => {
    const { payload, targetType = 'all', targetId } = req.body;
    
    try {
        let query = {};
        let recipientUserIds: string[] = [];
        let targetName = 'All Users';
        
        if (targetType === 'user' && targetId) {
            query = { userId: targetId };
            recipientUserIds = [targetId];
            const targetUser = await User.findById(targetId);
            if (targetUser) {
                targetName = (targetUser as any).displayName || targetUser.username;
            }
        } else if (targetType === 'team' && targetId) {
            const team = await FantasyTeam.findById(targetId);
            if (team && team.managers && team.managers.length > 0) {
                query = { userId: { $in: team.managers } };
                recipientUserIds = team.managers.map((m: any) => m.toString());
                targetName = team.name;
            } else {
                return res.status(404).json({ data: { message: "Team not found or has no managers" } });
            }
        }

        await Notification.create({
            title: payload?.title || 'Notification',
            message: payload?.body || payload?.message || JSON.stringify(payload),
            time: Date.now(),
            targetType,
            targetId: targetId || undefined,
            targetName,
            recipientUserIds,
            readBy: [],
            deletedBy: []
        });

        const subscribers = await Subscriber.find(query);

        subscribers.forEach((sub) => {
            const subscription = { endpoint: sub.endpoint, expirationTime: sub.expirationTime, keys: sub.keys };
            webpush.sendNotification(subscription, JSON.stringify(payload)).catch(async (err: Error) => {
                console.error("Error sending notification, removing subscription", err);
                await Subscriber.deleteOne({ endpoint: sub.endpoint });
            });
        });
        res.status(200).json({ message: "Notifications sent.." });
    } catch (e) {
        console.error(e);
        res.status(500).json({ data: { message: "Error sending notifications" } });
    }
}

export const notifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let userIdStr: string | null = null;
        if (req.user?.userId) {
            const user = await User.findOne({ username: req.user.userId });
            if (user) {
                userIdStr = user._id.toString();
            }
        }

        let query: any = {};
        if (userIdStr) {
            query = {
                deletedBy: { $ne: userIdStr },
                $or: [
                    { targetType: 'all' },
                    { recipientUserIds: userIdStr },
                    { targetId: userIdStr }
                ]
            };
        }

        const rawNotifications = await Notification.find(query).sort({ time: -1 });

        const mappedNotifications = rawNotifications.map((notif: any) => {
            const isRead = userIdStr ? (notif.readBy || []).includes(userIdStr) : false;
            return {
                id: notif._id.toString(),
                _id: notif._id.toString(),
                title: notif.title,
                message: notif.message,
                time: notif.time,
                targetType: notif.targetType || 'all',
                targetId: notif.targetId,
                targetName: notif.targetName,
                read: isRead,
            };
        });

        res.json({ data: mappedNotifications });

    } catch (e) {
        console.log(e);
        res.status(500).json({ data: { message: "Error fetching notifications" } });
    }
}

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ username: req.user.userId });
        if (!user) {
            return res.status(404).json({ data: { message: "User not found" } });
        }
        const userIdStr = user._id.toString();

        await Notification.findByIdAndUpdate(id, {
            $addToSet: { readBy: userIdStr }
        });

        res.json({ data: { message: "Notification marked as read" } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ data: { message: "Error marking notification as read" } });
    }
}

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findOne({ username: req.user.userId });
        if (!user) {
            return res.status(404).json({ data: { message: "User not found" } });
        }
        const userIdStr = user._id.toString();

        await Notification.updateMany(
            {
                deletedBy: { $ne: userIdStr },
                $or: [
                    { targetType: 'all' },
                    { recipientUserIds: userIdStr },
                    { targetId: userIdStr }
                ]
            },
            {
                $addToSet: { readBy: userIdStr }
            }
        );

        res.json({ data: { message: "All notifications marked as read" } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ data: { message: "Error marking all notifications as read" } });
    }
}

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ username: req.user.userId });
        if (!user) {
            return res.status(404).json({ data: { message: "User not found" } });
        }
        const userIdStr = user._id.toString();

        await Notification.findByIdAndUpdate(id, {
            $addToSet: { deletedBy: userIdStr }
        });

        res.json({ data: { message: "Notification deleted successfully" } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ data: { message: "Error deleting notification" } });
    }
}