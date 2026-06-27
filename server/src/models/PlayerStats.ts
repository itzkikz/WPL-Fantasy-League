import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayerStats extends Document {
    playerId: number;
    gameweeks: {
        id: number;
        stats: any;
        points: number;
        fixtureId: number;
    }[];
    totalPoints: number;
}

const PlayerStatsSchema: Schema = new Schema({
    playerId: { type: Number, required: true, unique: true },
    gameweeks: [
        {
            id: { type: Number, required: true },
            stats: { type: Schema.Types.Mixed, required: true },
            points: { type: Number, default: 0 },
            fixtureId: { type: Number, required: true },
        }
    ],
    totalPoints: { type: Number, default: 0 }
}, { timestamps: true });

export const PlayerStats = mongoose.model<IPlayerStats>('PlayerStats', PlayerStatsSchema);
