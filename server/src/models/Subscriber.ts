import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriber extends Document {
    userId: string;
    endpoint: string;
    expirationTime: number | null;
    keys: {
        p256dh: string;
        auth: string;
    };
}

const SubscriberSchema: Schema = new Schema({
    userId: { type: String, required: true },
    endpoint: { type: String, required: true, unique: true },
    expirationTime: { type: Number, default: null },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
    }
}, { timestamps: true });

export const Subscriber = mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);
