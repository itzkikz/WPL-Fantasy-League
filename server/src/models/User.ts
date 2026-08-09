import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IDeviceInfo {
    pwaInstalled?: boolean;
    standalone?: boolean;
    os?: string;
    browser?: string;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    pushSubscribed?: boolean;
    firstSubscribedAt?: Date;
    lastSeenAt?: Date;
}

export interface IUser extends Document {
    username: string;
    email: string; // Added for invites
    info: string; // Preserved from your schema
    role: 'admin' | 'user' | 'manager';
    device?: IDeviceInfo;
}

const DeviceSchema: Schema = new Schema({
    pwaInstalled: { type: Boolean, default: undefined },
    standalone: { type: Boolean, default: undefined },
    os: { type: String, default: undefined },
    browser: { type: String, default: undefined },
    deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: undefined },
    pushSubscribed: { type: Boolean, default: undefined },
    firstSubscribedAt: { type: Date, default: undefined },
    lastSeenAt: { type: Date, default: undefined }
}, { _id: false });

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    info: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'user', 'manager'], default: 'user' },
    device: { type: DeviceSchema, default: undefined }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
