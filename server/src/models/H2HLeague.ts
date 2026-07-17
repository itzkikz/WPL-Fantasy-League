import mongoose, { Document, Schema } from 'mongoose';

export interface IH2HLeague extends Document {
    name: string;
    fantasyTeams: mongoose.Types.ObjectId[];
    gameweekStart: number;
    gameweekEnd: number;
    season: number;
    isComplete: boolean;
}

const H2HLeagueSchema: Schema = new Schema({
    name: { type: String, required: true },
    fantasyTeams: [{ type: Schema.Types.ObjectId, ref: 'FantasyTeam', required: true }],
    gameweekStart: { type: Number, required: true },
    gameweekEnd: { type: Number, required: true },
    season: { type: Number, default: 1 },
    isComplete: { type: Boolean, default: false },
}, { timestamps: true });

H2HLeagueSchema.index({ season: 1 }, { unique: true });

export const H2HLeague = mongoose.model<IH2HLeague>('H2HLeague', H2HLeagueSchema);
