import mongoose, { Document, Schema, Model } from 'mongoose';

// --- Sub-Schemas (Interfaces) ---

interface IPick {
    playerId: number; // Player ID (from Bootstrap Static)
    isCaptain: boolean;
    isViceCaptain: boolean;
    isStarting: boolean;
    subNumber: number;
    // statsSnapshot?: { // Snapshot for history
    //     points: number;
    //     goals: number;
    //     assists: number;
    //     cleanSheets: number;
    // };
}

interface IHistory {
    gameweek: number;
    // points: number;
    // rank: number;
    // bank: number;
    // teamValue: number;
    picks: IPick[];
    preAutoSubPicks?: IPick[];
}

// --- Main Interface ---

export interface IFantasyTeam extends Document {
    name: string; // Team Name
    managers: mongoose.Types.ObjectId[]; // Shared ownership (Users)
    managerDisplayNames: string; // Display names from seed data
    createdBy: mongoose.Types.ObjectId;
    finance: {
        totalBudget: number;
        utilisation: number;
        balance: number; // Calculated: total - utilisation
    };
    currentSquad: {
        picks: IPick[];
    };
    history: IHistory[];
}

// --- Schemas ---

const PickSchema = new Schema({
    playerId: { type: Number, required: true }, // Ref ID to Player Data
    isCaptain: { type: Boolean, default: false },
    isViceCaptain: { type: Boolean, default: false },
    isStarting: { type: Boolean, default: false },
    subNumber: { type: Number, default: 0 }
    // statsSnapshot: { // Optional, populated only in history
    //     points: Number,
    //     goals: Number,
    //     assists: Number,
    //     cleanSheets: Number
    // }
}, { _id: false });

const HistorySchema = new Schema({
    gameweek: { type: Number, required: true },
    picks: [PickSchema],
    preAutoSubPicks: [PickSchema]
}, { _id: false });

const FantasyTeamSchema: Schema = new Schema({
    name: { type: String, required: true, default: "My Team" },

    // OWNERSHIP: Links to User Model
    managers: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
    managerDisplayNames: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // FINANCES
    finance: {
        totalBudget: { type: Number, default: 1000 }, // e.g. 100.0m
        utilisation: { type: Number, default: 0 },
        balance: { type: Number, default: 1000 }
    },
    // SQUADS
    currentSquad: {
        picks: { type: [PickSchema], default: [] },
    },
    history: [HistorySchema],
}, { timestamps: true });

// Pre-save hook to calculate balance automatically
FantasyTeamSchema.pre('save', function () {
    if (this.isModified('finance')) {
        const self = this as unknown as IFantasyTeam;
        self.finance.balance = self.finance.totalBudget - self.finance.utilisation;
    }
});

export const FantasyTeam = mongoose.model<IFantasyTeam>('FantasyTeam', FantasyTeamSchema);
