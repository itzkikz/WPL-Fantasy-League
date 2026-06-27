import mongoose, { Document, Schema } from 'mongoose';

export interface ILeague extends Document {
    name: string;
    participants: mongoose.Types.ObjectId[]; // List of FantasyTeams (or Users)
    createdOn: Date;
    seasonId?: mongoose.Types.ObjectId;
    leagueId?: number;
    code?: string;
    type?: string;
}

const LeagueSchema: Schema = new Schema({
    name: { type: String, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    createdOn: { type: Date, default: Date.now },
    seasonId: { type: Schema.Types.ObjectId, ref: 'Season' },
    leagueId: { type: Number },
    code: { type: String },
    type: { type: String }
}, { timestamps: true });

export const League = mongoose.model<ILeague>('League', LeagueSchema);
