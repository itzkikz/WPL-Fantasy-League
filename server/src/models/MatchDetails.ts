import mongoose, { Document, Schema } from 'mongoose';

export interface IMatchDetails extends Document {
    fixtureId: number;
    players: any[];
    events: any[];
}

const MatchDetailsSchema: Schema = new Schema({
    fixtureId: { type: Number, required: true, unique: true, index: true },
    players: [{ type: Schema.Types.Mixed }],
    events: [{ type: Schema.Types.Mixed }]
}, { timestamps: true });

export const MatchDetails = mongoose.model<IMatchDetails>('MatchDetails', MatchDetailsSchema);
