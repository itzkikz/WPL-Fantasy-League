import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer extends Document {
    id: number;
    name: string;
    webName?: string;
    firstName?: string;
    lastName?: string;
    age: number;
    number: number;
    position: string;
    photo: string;
    teamId: number;
}

const PlayerSchema: Schema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number },
    number: { type: Number },
    position: { type: String },
    photo: { type: String },
    teamId: { type: Number, required: true, index: true }
}, { timestamps: true, strict: false });

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
