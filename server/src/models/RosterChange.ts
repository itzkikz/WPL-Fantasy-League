import mongoose, { Document, Schema } from 'mongoose';

export interface IRosterChangePlayer {
    playerId: number;
    name: string;
    position?: string;
}

export interface IRosterChange extends Document {
    teamId: number;
    teamName: string;
    added: IRosterChangePlayer[];
    removed: IRosterChangePlayer[];
    totalBefore: number;
    totalAfter: number;
    createdBy: mongoose.Types.ObjectId;
    date: Date;
}

const RosterChangePlayerSchema = new Schema({
    playerId: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, default: '' },
}, { _id: false });

const RosterChangeSchema: Schema = new Schema({
    teamId: { type: Number, required: true, index: true },
    teamName: { type: String, required: true },
    added: [RosterChangePlayerSchema],
    removed: [RosterChangePlayerSchema],
    totalBefore: { type: Number, default: 0 },
    totalAfter: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

RosterChangeSchema.index({ teamId: 1, date: -1 });

export const RosterChange = mongoose.model<IRosterChange>('RosterChange', RosterChangeSchema);