import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string; // Added for invites
    password: string; // Hashed
    isTempPassword: boolean;
    info: string; // Preserved from your schema

    // Relationship: Lists teams this user manages
    managedTeams: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // Ensure this stores a hash!
    isTempPassword: { type: Boolean, default: false },
    info: { type: String, default: '' },

    managedTeams: [{ type: Schema.Types.ObjectId, ref: 'FantasyTeam' }]
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
