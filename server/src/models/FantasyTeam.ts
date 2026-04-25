import mongoose, { Document, Schema, Model } from 'mongoose';

// --- Sub-Schemas (Interfaces) ---

interface IPick {
    element: number; // Player ID (from Bootstrap Static)
    position: number; // 1-15
    isCaptain: boolean;
    isViceCaptain: boolean;
    multiplier: number;
    statsSnapshot?: { // Snapshot for history
        points: number;
        goals: number;
        assists: number;
        cleanSheets: number;
    };
}

interface IHistory {
    gameweek: number;
    points: number;
    rank: number;
    bank: number;
    teamValue: number;
    picks: IPick[];
}

// --- Main Interface ---

export interface IFantasyTeam extends Document {
    name: string; // Team Name
    managers: mongoose.Types.ObjectId[]; // Shared ownership (Users)
    managerDisplayNames: string; // Display names from seed data
    createdBy: mongoose.Types.ObjectId;

    // Game State (Preserved from your schema)
    currentGw: number; // mapped from your 'gw'
    deadline: Date;
    pickMyTeam: boolean; // Preserved flag

    // Finances (Preserved from your schema)
    finance: {
        totalBudget: number;
        utilisation: number;
        balance: number; // Calculated: total - utilisation
    };

    // Squads
    currentSquad: {
        picks: IPick[];
        activeChip: string | null;
        gameweek: number;
        points: number;
    };

    history: IHistory[];
    leagues?: mongoose.Types.ObjectId[];
}

// --- Schemas ---

const PickSchema = new Schema({
    element: { type: Number, required: true }, // Ref ID to Player Data
    position: { type: Number, required: true },
    isCaptain: { type: Boolean, default: false },
    isViceCaptain: { type: Boolean, default: false },
    multiplier: { type: Number, default: 1 },
    statsSnapshot: { // Optional, populated only in history
        points: Number,
        goals: Number,
        assists: Number,
        cleanSheets: Number
    }
}, { _id: false });

const HistorySchema = new Schema({
    gameweek: { type: Number, required: true },
    points: { type: Number, default: 0 },
    rank: Number,
    bank: Number,
    teamValue: Number,
    picks: [PickSchema]
}, { _id: false });

const FantasyTeamSchema: Schema = new Schema({
    name: { type: String, required: true, default: "My Team" },

    // OWNERSHIP: Links to User Model
    managers: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
    managerDisplayNames: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // GAME STATE
    currentGw: { type: Number, default: 1 }, // Renamed from 'gw' for clarity
    deadline: { type: Date },
    pickMyTeam: { type: Boolean, default: false }, // "Auto-pick" flag?

    // FINANCES
    finance: {
        totalBudget: { type: Number, default: 1000 }, // e.g. 100.0m
        utilisation: { type: Number, default: 0 },
        balance: { type: Number, default: 1000 }
    },

    // SQUADS
    currentSquad: {
        picks: { type: [PickSchema], default: [] },
        activeChip: { type: String, default: null },
        gameweek: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
    },

    history: [HistorySchema],

    // LEAGUES: Inverted relationship for scalability
    leagues: [{ type: Schema.Types.ObjectId, ref: 'League' }]
}, { timestamps: true });

// Pre-save hook to calculate balance automatically
FantasyTeamSchema.pre('save', function () {
    if (this.isModified('finance')) {
        const self = this as unknown as IFantasyTeam;
        self.finance.balance = self.finance.totalBudget - self.finance.utilisation;
    }
});

export const FantasyTeam = mongoose.model<IFantasyTeam>('FantasyTeam', FantasyTeamSchema);
