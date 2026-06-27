import { NextFunction, Request, Response } from "express";
import { getSheets } from "../lib/store/globals";
import { convertToJSON } from "../utils";
import { Notifications } from "../types/users";
import jwt from 'jsonwebtoken'
import { sheets_v4 } from "googleapis";
import { Subscriber } from "../models/Subscriber";
import { Notification } from "../models/Notification";
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
        const userId = req.user.userId;

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
    const { payload } = req.body;
    
    try {
        await Notification.create({
            title: payload?.title || 'Notification',
            message: payload?.body || payload?.message || JSON.stringify(payload),
            time: Date.now()
        });

        const subscribers = await Subscriber.find({});

        subscribers.forEach((sub) => {
            const subscription = { endpoint: sub.endpoint, expirationTime: sub.expirationTime, keys: sub.keys };
            webpush.sendNotification(subscription, JSON.stringify(payload)).catch(async (err: Error) => {
                console.error("Error sending notification, removing subscription", err);
                await Subscriber.deleteOne({ endpoint: sub.endpoint });
            });
        });
        res.status(200).json({ message: "Notifications sent.." });
    } catch (e) {
        console.log(e);
        res.status(500).json({ data: { message: "Error sending notifications" } });
    }
}

export const notifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await Notification.find({}).sort({ time: -1 });

        res.json({ data: notifications })

    } catch (e) {
        console.log(e)
        res.status(500).json({ data: { message: "Error fetching notifications" } })
    }
}