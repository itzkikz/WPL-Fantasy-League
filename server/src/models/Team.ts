import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
    id: number;
    name: string;
    slug: string;
    shortName: string;
    nameCode: string;
    disabled: boolean;
    national: boolean;
    type: number;
    country: {
        alpha2: string;
        alpha3: string;
        name: string;
        slug: string;
    };
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
    slug: { type: String },
    shortName: { type: String },
    nameCode: { type: String },
    disabled: { type: Boolean },
    national: { type: Boolean },
    type: { type: Number },
    country: {
        alpha2: { type: String },
        alpha3: { type: String },
        name: { type: String },
        slug: { type: String }
    },
    teamColors: {
        primary: { type: String },
        secondary: { type: String },
        text: { type: String }
    },
    league: { type: Schema.Types.ObjectId, ref: 'League' }
}, { timestamps: true });

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
