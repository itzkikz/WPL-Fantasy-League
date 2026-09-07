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
import { sendNotification } from "../services/notify";

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

        // Mirror subscription status onto the user's device info
        await User.updateOne(
            { _id: userId },
            { $set: { 'device.pushSubscribed': true } }
        );
        await User.updateOne(
            { _id: userId, 'device.firstSubscribedAt': { $exists: false } },
            { $set: { 'device.firstSubscribedAt': new Date() } }
        );

        res.json({ data: { message: "User Subscribed" } })

    } catch (e) {
        console.log(e)
        res.status(403).json({ data: { message: e } })
    }
}

export const send = async (req: Request, res: Response, next: NextFunction) => {
    const { payload, targetType = 'all', targetId } = req.body;

    try {
        await sendNotification({
            title: payload?.title || 'Notification',
            message: payload?.body || payload?.message || JSON.stringify(payload),
            targetType,
            targetId,
            kind: payload?.kind,
            url: payload?.url,
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
                kind: notif.kind || 'general',
                url: notif.url,
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