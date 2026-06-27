import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string; // Added for invites
    info: string; // Preserved from your schema
    role: 'admin' | 'user' | 'manager';
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    info: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'user', 'manager'], default: 'user' }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
