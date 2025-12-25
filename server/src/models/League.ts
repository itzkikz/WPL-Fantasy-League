import mongoose, { Document, Schema } from 'mongoose';

export interface ILeague extends Document {
    name: string;
    code?: string; // Unique join code
    admin?: mongoose.Types.ObjectId; // User who created it
    participants: mongoose.Types.ObjectId[]; // List of FantasyTeams (or Users)
    type: 'public' | 'private';
    createdOn: Date;
    seasonId?: mongoose.Types.ObjectId;
}

const LeagueSchema: Schema = new Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true, index: true }, // Optional for system leagues
    admin: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional for system leagues
    // Participants reference FantasyTeams so we can easily show standings
    participants: [{ type: Schema.Types.ObjectId, ref: 'FantasyTeam' }],
    type: { type: String, enum: ['public', 'private'], default: 'private' },
    createdOn: { type: Date, default: Date.now },
    seasonId: { type: Schema.Types.ObjectId, ref: 'Season' }
}, { timestamps: true });

export const League = mongoose.model<ILeague>('League', LeagueSchema);
