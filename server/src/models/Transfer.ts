import mongoose, { Document, Schema } from 'mongoose';

export interface ITransferPlayer {
    playerId: number;
    name: string;
    position: string;
    tmPosition?: string;
    auctionPrice: number | null;
    isCaptain: boolean;
    isViceCaptain: boolean;
    isStarting: boolean;
    subNumber: number;
}

export interface ITransfer extends Document {
    fantasyTeam: mongoose.Types.ObjectId;
    teamName: string;
    type: 'swap' | 'release' | 'sign';
    playerOut: ITransferPlayer | null;
    playerIn: ITransferPlayer | null;
    gameweek: number;
    date: Date;
    note?: string;
    createdBy: mongoose.Types.ObjectId;
}

const TransferPlayerSchema = new Schema({
    playerId: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, default: '' },
    tmPosition: { type: String, default: '' },
    auctionPrice: { type: Number, default: null },
    isCaptain: { type: Boolean, default: false },
    isViceCaptain: { type: Boolean, default: false },
    isStarting: { type: Boolean, default: false },
    subNumber: { type: Number, default: 0 },
}, { _id: false });

const TransferSchema: Schema = new Schema({
    fantasyTeam: { type: Schema.Types.ObjectId, ref: 'FantasyTeam', required: true, index: true },
    teamName: { type: String, required: true },
    type: { type: String, enum: ['swap', 'release', 'sign'], required: true },
    playerOut: { type: TransferPlayerSchema, default: null },
    playerIn: { type: TransferPlayerSchema, default: null },
    gameweek: { type: Number, required: true, index: true },
    date: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

TransferSchema.index({ fantasyTeam: 1, date: -1 });

export const Transfer = mongoose.model<ITransfer>('Transfer', TransferSchema);
