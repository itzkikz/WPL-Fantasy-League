import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
    id: number; // SofaScore ID
    name: string;
    shortName: string;
    nameCode: string; // "ARS"
    slug: string;

    // FPL specific fields (Optional now)
    strength?: number;
    strengthOverallHome?: number;
    strengthOverallAway?: number;
    strengthAttackHome?: number;
    strengthAttackAway?: number;
    strengthDefenceHome?: number;
    strengthDefenceAway?: number;
    pulseId?: number;

    teamColors: {
        primary: string;
        secondary: string;
        text: string;
    };

    league?: mongoose.Types.ObjectId;
}

const TeamSchema: Schema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    nameCode: { type: String, required: true },
    slug: { type: String, required: true },

    strength: Number,
    strengthOverallHome: Number,
    strengthOverallAway: Number,
    strengthAttackHome: Number,
    strengthAttackAway: Number,
    strengthDefenceHome: Number,
    strengthDefenceAway: Number,
    pulseId: Number,

    teamColors: {
        primary: String,
        secondary: String,
        text: String
    },

    league: { type: Schema.Types.ObjectId, ref: 'League' }
}, { timestamps: true });

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
