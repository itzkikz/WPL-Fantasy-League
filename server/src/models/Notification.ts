import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    title: string;
    message: string;
    time: number;
}

const NotificationSchema: Schema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: Number, required: true }
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
