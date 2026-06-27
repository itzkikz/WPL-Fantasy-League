import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
    team: {
        id: number;
        name: string;
        code: string;
        country: string;
        founded: number;
        national: boolean;
        logo: string;
    };
    venue: {
        id: number;
        name: string;
        address: string;
        city: string;
        capacity: number;
        surface: string;
        image: string;
    };
    league?: mongoose.Types.ObjectId;
}

const TeamSchema: Schema = new Schema({
    team: {
        id: { type: Number, required: true, unique: true },
        name: { type: String, required: true },
        code: { type: String },
        country: { type: String },
        founded: { type: Number },
        national: { type: Boolean },
        logo: { type: String }
    },
    venue: {
        id: { type: Number },
        name: { type: String },
        address: { type: String },
        city: { type: String },
        capacity: { type: Number },
        surface: { type: String },
        image: { type: String }
    },
    league: { type: Schema.Types.ObjectId, ref: 'League' }
}, { timestamps: true });

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
