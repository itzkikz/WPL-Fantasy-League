import mongoose, { Document, Schema } from 'mongoose';

export interface ILineupEntry {
    playerId: number;
    teamId: number;
    statistics: any;
    side: 'home' | 'away';
    position: string;
}

export interface IMatchDetails extends Document {
    fixtureId: number;
    incidents: any[];
    lineups: ILineupEntry[];
    players: any[];
    events: any[];
    addedtofantasy: boolean;
}

const LineupEntrySchema: Schema = new Schema({
    playerId: { type: Number, required: true },
    teamId: { type: Number, required: true },
    statistics: { type: Schema.Types.Mixed, default: {} },
    side: { type: String, enum: ['home', 'away'], required: true },
    position: { type: String, default: '' }
}, { _id: false });

const MatchDetailsSchema: Schema = new Schema({
    fixtureId: { type: Number, required: true, unique: true, index: true },
    incidents: [{ type: Schema.Types.Mixed }],
    lineups: [LineupEntrySchema],
    players: { type: Schema.Types.Mixed },
    events: { type: Schema.Types.Mixed },
    addedtofantasy: { type: Boolean, default: false }
}, { timestamps: true });

export const MatchDetails = mongoose.model<IMatchDetails>('MatchDetails', MatchDetailsSchema);
