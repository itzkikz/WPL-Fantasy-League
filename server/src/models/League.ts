import mongoose, { Document, Schema } from 'mongoose';

export interface ILeague extends Document {
    name: string; // league name (e.g., "Premier League")
    participants: mongoose.Types.ObjectId[]; // List of FantasyTeams (or Users)
    createdOn: Date;
    seasonId?: mongoose.Types.ObjectId; // reference to Season
    leagueId?: number; // external league ID (e.g., 39 for Premier League)
    leagueSeasonId?: number; // external league season ID (e.g., 96668)
    leagueSeason?: string; // e.g., "26-27"
    teams?: mongoose.Types.ObjectId[]; // references to Team documents (actual football clubs)
    totalRounds?: number; // total number of rounds in the season
    currentRound?: number; // current round number
    code?: string;
    type?: string;
}

const LeagueSchema: Schema = new Schema({
    name: { type: String, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'FantasyTeam' }],
    createdOn: { type: Date, default: Date.now },
    seasonId: { type: Schema.Types.ObjectId, ref: 'Season' },
    leagueId: { type: Number },
    leagueSeasonId: { type: Number },
    leagueSeason: { type: String },
    teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    totalRounds: { type: Number },
    currentRound: { type: Number },
    code: { type: String },
    type: { type: String }
}, { timestamps: true });

export const League = mongoose.model<ILeague>('League', LeagueSchema);