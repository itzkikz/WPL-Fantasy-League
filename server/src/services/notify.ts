import { Subscriber } from '../models/Subscriber';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { FantasyTeam } from '../models/FantasyTeam';

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

export type NotificationKind = 'gameweek' | 'points' | 'transfer' | 'news' | 'general';

export interface SendNotificationOptions {
    title: string;
    message: string;
    targetType?: 'all' | 'user' | 'team';
    targetId?: string;
    targetName?: string;
    kind?: NotificationKind;
    url?: string;
}

/**
 * Creates a Notification document and sends web-push to matching subscribers.
 * Best-effort for push delivery: failures only clean up stale subscriptions and
 * never throw, so callers (admin actions) are never broken by notification issues.
 * Throws only on invalid targeting (e.g. a team with no managers).
 */
export const sendNotification = async (options: SendNotificationOptions): Promise<void> => {
    const { title, message, kind, url } = options;
    const targetType = options.targetType || 'all';
    const targetId = options.targetId;

    let query = {};
    let recipientUserIds: string[] = [];
    let targetName = options.targetName || 'All Users';

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
            throw new Error("Team not found or has no managers");
        }
    }

    await Notification.create({
        title: title || 'Notification',
        message: message || '',
        time: Date.now(),
        targetType,
        targetId: targetId || undefined,
        targetName,
        kind: kind || 'general',
        url: url || undefined,
        recipientUserIds,
        readBy: [],
        deletedBy: []
    });

    const subscribers = await Subscriber.find(query);

    subscribers.forEach((sub) => {
        const subscription = { endpoint: sub.endpoint, expirationTime: sub.expirationTime, keys: sub.keys };
        webpush.sendNotification(subscription, JSON.stringify({ title, body: message, url, icon: '/pwa-192x192.png', badge: '/pwa-192x192.png' }))
            .catch(async (err: Error) => {
                console.error("Error sending notification, removing subscription", err);
                await Subscriber.deleteOne({ endpoint: sub.endpoint });
                const remaining = await Subscriber.countDocuments({ userId: sub.userId });
                if (remaining === 0) {
                    await User.updateOne(
                        { _id: sub.userId },
                        { $set: { 'device.pushSubscribed': false } }
                    );
                }
            });
    });
};
