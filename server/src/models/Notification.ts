import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    title: string;
    message: string;
    time: number;
    targetType?: 'all' | 'user' | 'team';
    targetId?: string;
    targetName?: string;
    recipientUserIds?: string[];
    readBy?: string[];
    deletedBy?: string[];
}

const NotificationSchema: Schema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: Number, required: true },
    targetType: { type: String, enum: ['all', 'user', 'team'], default: 'all' },
    targetId: { type: String },
    targetName: { type: String },
    recipientUserIds: [{ type: String }],
    readBy: [{ type: String }],
    deletedBy: [{ type: String }]
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
