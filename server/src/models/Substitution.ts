import mongoose, { Document, Schema } from 'mongoose';

export interface ISubstitutionPlayer {
    playerId: number;
    name: string;
    position: string;
    teamId: number;
}

export type SubstitutionType = 'swap' | 'captain' | 'vice-captain';

export interface ISubstitution extends Document {
    fantasyTeam: mongoose.Types.ObjectId;
    teamName: string;
    type: SubstitutionType;
    gameweek: number;
    swapIn: ISubstitutionPlayer;
    swapOut: ISubstitutionPlayer;
    date: Date;
    note?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SubstitutionPlayerSchema = new Schema({
    playerId: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    teamId: { type: Number, required: true },
}, { _id: false });

const SubstitutionSchema: Schema = new Schema({
    fantasyTeam: { type: Schema.Types.ObjectId, ref: 'FantasyTeam', required: true, index: true },
    teamName: { type: String, required: true },
    type: { type: String, enum: ['swap', 'captain', 'vice-captain'], required: true, default: 'swap' },
    gameweek: { type: Number, required: true, index: true },
    swapIn: { type: SubstitutionPlayerSchema, required: true },
    swapOut: { type: SubstitutionPlayerSchema, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

SubstitutionSchema.index({ fantasyTeam: 1, date: -1 });

export const Substitution = mongoose.model<ISubstitution>('Substitution', SubstitutionSchema);