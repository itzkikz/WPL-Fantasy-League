import mongoose, { Document, Schema } from 'mongoose';

export interface IH2HFixture extends Document {
    league: mongoose.Types.ObjectId;
    homeTeam: mongoose.Types.ObjectId;
    awayTeam: mongoose.Types.ObjectId;
    gameweek: number;
    homeScore: number | null;
    awayScore: number | null;
    status: 'upcoming' | 'completed';
    winner: mongoose.Types.ObjectId | 'draw' | null;
}

const H2HFixtureSchema: Schema = new Schema({
    league: { type: Schema.Types.ObjectId, ref: 'H2HLeague', required: true, index: true },
    homeTeam: { type: Schema.Types.ObjectId, ref: 'FantasyTeam', required: true },
    awayTeam: { type: Schema.Types.ObjectId, ref: 'FantasyTeam', required: true },
    gameweek: { type: Number, required: true, index: true },
    homeScore: { type: Number, default: null },
    awayScore: { type: Number, default: null },
    status: { type: String, enum: ['upcoming', 'completed'], default: 'upcoming' },
    winner: { type: Schema.Types.Mixed, default: null },
}, { timestamps: true });

// Compound index for quick lookups
H2HFixtureSchema.index({ league: 1, gameweek: 1 });
H2HFixtureSchema.index({ league: 1, status: 1 });

export const H2HFixture = mongoose.model<IH2HFixture>('H2HFixture', H2HFixtureSchema);
