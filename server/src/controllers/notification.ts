import { NextFunction, Request, Response } from "express";
import { getSheets } from "../lib/store/globals";
import { convertToJSON } from "../utils";
import { Notifications, Subscribers, Users } from "../types/users";
import jwt from 'jsonwebtoken'
import { sheets_v4 } from "googleapis";
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
        const subscription: Subscribers = req.body.subscription;
        const teamName = req.user.userId;
        const response = await getSheets()?.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Subscriptions!A:D", // Adjust range as needed
        });
        const subscriberRows: Row[] = (response?.data?.values as Row[]) ?? []; // 2D array

        const subscribers: Subscribers[] = convertToJSON(subscriberRows, 'subscribers');

        const subscriber = subscribers.find((val) => val?.username === teamName && val?.endpoint === subscription.endpoint)

        if (subscriber?.endpoint) {
            return res.status(200).json({ data: { message: "Already Subscribed" } })
        }
        const newValues = [[teamName, subscription.endpoint, subscription?.expirationTime, JSON.stringify(subscription?.keys)]]
        await getSheets()?.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "Subscriptions!A:D",
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: newValues },
        });
        res.json({ data: { message: "User Subscribed" } })

    } catch (e) {
        console.log(e)
        res.status(403).json({ data: { message: e } })
    }
    // const subscriptions = await SubscriptionModel.findOne({
    //     endpoint: req.body.endpoint,
    //   });

    //   if (subscriptions?.endpoint) {
    //     return res.status(200).json({ message: "Subscription already exists." });
    //   } else {
    //     const sub = req.body;
    //     // Unique index on endpoint in the database recommended
    //     await SubscriptionModel.updateOne(
    //       { endpoint: sub.endpoint }, // unique check
    //       {
    //         $set: {
    //           endpoint: sub.endpoint,
    //           expirationTime: sub.expirationTime,
    //           keys: sub.keys,
    //         },
    //       },
    //       { upsert: true }
    //     );
    //     res.status(201).json({ message: "Subscription added successfully." });
    //   }
}

export const send = async (req: Request, res: Response, next: NextFunction) => {
    const { payload } = req.body;

    const response = await getSheets()?.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Subscriptions!A:D", // Adjust range as needed
    });

    const subscriberRows: Row[] = (response?.data?.values as Row[]) ?? []; // 2D array

    const subscribers: Subscribers[] = convertToJSON(subscriberRows, 'subscribers');

    const subWithoutUserName = subscribers.map(({ username, ...rest }) => rest);

    subWithoutUserName.forEach((sub) => {
        const jsonKeys = JSON.parse(sub.keys)
        const subscription = { endpoint: sub.endpoint, expirationTime: sub.expirationTime, keys: jsonKeys }
        webpush.sendNotification(subscription, JSON.stringify(payload)).catch((err: Error) => {
            console.error("Error sending notification, removing subscription", err);
            const index = subWithoutUserName.indexOf(subscription);
            if (index > -1) {
                subscribers.splice(index, 1);
            }
        });
    });
    res.status(200).json({ message: "Notifications sent.." });
}

export const notifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await getSheets()?.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Notifications!A:C", // Adjust range as needed
        });
        const notificationRows: Row[] = (response?.data?.values as Row[]) ?? []; // 2D array

        const notifications: Notifications[] = convertToJSON(notificationRows, 'notifications');

        res.json({ data: notifications })

    } catch (e) {
        console.log(e)
        res.status(403).json({ data: { message: e } })
    }
}