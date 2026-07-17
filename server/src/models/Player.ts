import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer extends Document {
    id: number;
    name: string;
    webName?: string;
    slug?: string;
    shortName?: string;
    age?: number;
    number?: number;
    photo?: string;
    teamId: number;
    position?: string;
    positionsDetailed?: string[];
    weight?: number;
    jerseyNumber?: string;
    height?: number;
    dateOfBirth?: string;
    preferredFoot?: string;
    retired?: boolean;
    userCount?: number;
    deceased?: boolean;
    gender?: string;
    sofascoreId?: string;
    underage?: boolean;
    shirtNumber?: number;
    dateOfBirthTimestamp?: number;
    contractUntilTimestamp?: number;
    proposedMarketValue?: number;
    proposedMarketValueRaw?: {
        value?: number;
        currency?: string;
    };
    country?: {
        alpha2?: string;
        alpha3?: string;
        name?: string;
        slug?: string;
    };
    auctionPrice?: number;
}

const PlayerSchema: Schema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String },
    shortName: { type: String },
    teamId: { type: Number, required: true, index: true },
    position: { type: String },
    positionsDetailed: { type: [String] },
    weight: { type: Number },
    jerseyNumber: { type: String },
    height: { type: Number },
    dateOfBirth: { type: String },
    preferredFoot: { type: String },
    retired: { type: Boolean },
    userCount: { type: Number },
    deceased: { type: Boolean },
    gender: { type: String },
    sofascoreId: { type: String },
    underage: { type: Boolean },
    shirtNumber: { type: Number },
    dateOfBirthTimestamp: { type: Number },
    contractUntilTimestamp: { type: Number },
    proposedMarketValue: { type: Number },
    proposedMarketValueRaw: {
        value: { type: Number },
        currency: { type: String }
    },
    country: {
        alpha2: { type: String },
        alpha3: { type: String },
        name: { type: String },
        slug: { type: String }
    },
    auctionPrice: { type: Number },
}, { timestamps: true, strict: false });

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
