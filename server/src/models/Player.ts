import mongoose, { Document, Schema, Model } from 'mongoose';

// --- Interfaces for Type Safety ---

interface IPlayerStats {
    totalPoints: number;
    form: string;
    pointsPerGame: string;
    appearances: number;
    goalsScored: number;
    assists: number;
    cleanSheets: number;
    goalsConceded: number;
    ownGoals: number;
    penaltiesSaved: number;
    penaltiesMissed: number;
    yellowCards: number;
    redCards: number;
    saves: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ictIndex: string;
    expectedGoals: string; // xG
    expectedAssists: string; // xA
    xPoints: number;
}

interface IPlayerStatus {
    availability: 'a' | 'd' | 'i' | 's' | 'n'; // Available, Doubt, Injured, Suspended, Unavailable
    news: string; // "Hamstring injury - 75% chance of playing"
    chancePlayingNextRound: number | null;
    chancePlayingThisRound: number | null;
}

export interface IPlayer extends Document {
    // Core Identifiers
    id: number; // SofaScore ID
    slug: string;
    name: string;
    shortName: string;
    webName: string; // e.g., "Salah"
    fullName: string;

    // Relationships
    teamId: number; // SofaScore Team ID
    clubName?: string;

    // SofaScore specific
    shirtNumber: number;
    position: string; // G, D, M, F
    height: number;
    preferredFoot: string;
    country: {
        alpha2: string;
        name: string;
    };
    marketValue: number;
    proposedMarketValue: number;
    marketValueCurrency: string;
    userCount: number;

    elementType: number; // 1=GKP, 2=DEF, 3=MID, 4=FWD

    // Pricing
    price: {
        nowCost: number; // e.g., 125 for £12.5m
        costChangeStart: number;
        costChangeEvent: number;
    };

    // Status & News
    status: IPlayerStatus;

    // Performance Stats (Season Totals)
    stats: IPlayerStats;

    // Embedded Game-by-Game History (Crucial for graphs)
    history: {
        gameweek: number;
        fixtureId: number;
        opponentTeamId: number;
        wasHome: boolean;
        totalPoints: number;
        xPoints: number;
        appearances: number;
        goalsScored: number;
        assists: number;
        cleanSheets: number;
        goalsConceded: number;
        ownGoals: number;
        penaltiesSaved: number;
        penaltiesMissed: number;
        yellowCards: number;
        redCards: number;
        saves: number;
        bonus: number;
        bps: number;
        price: number; // Price at that specific GW
    }[];
}

// --- Mongoose Schema ---

const PlayerStatsSchema = new Schema({
    totalPoints: { type: Number, default: 0, index: true }, // Index for sorting "Top Players"
    form: String,
    pointsPerGame: String,
    appearances: Number,
    goalsScored: Number,
    assists: Number,
    cleanSheets: Number,
    goalsConceded: Number,
    ownGoals: Number,
    penaltiesSaved: Number,
    penaltiesMissed: Number,
    yellowCards: Number,
    redCards: Number,
    saves: Number,
    bonus: Number,
    bps: Number,
    influence: String,
    creativity: String,
    threat: String,
    ictIndex: String,
    expectedGoals: String,
    expectedAssists: String,
    xPoints: { type: Number, default: 0 } // Add xPoints to stats
}, { _id: false });

const PlayerHistorySchema = new Schema({
    gameweek: { type: Number, required: true },
    fixtureId: Number,
    opponentTeamId: Number,
    wasHome: Boolean,
    totalPoints: Number,
    xPoints: { type: Number, default: 0 }, // Add xPoints to history
    appearances: Number,
    goalsScored: Number,
    assists: Number,
    cleanSheets: Number,
    goalsConceded: Number,
    ownGoals: Number,
    penaltiesSaved: Number,
    penaltiesMissed: Number,
    yellowCards: Number,
    redCards: Number,
    saves: Number,
    bonus: Number,
    bps: Number,
    price: Number
}, { _id: false });

const PlayerSchema: Schema = new Schema({
    id: { type: Number, required: true, unique: true }, // SofaScore ID now
    slug: { type: String, required: true },
    name: { type: String }, // Display name
    shortName: String,
    webName: { type: String, index: true }, // Keeping for compatibility, default to shortName
    fullName: String,

    teamId: { type: Number, required: true, index: true }, // SofaScore Team ID
    clubName: String, // from Google Sheet

    // SofaScore Data
    shirtNumber: Number,
    position: String, // G, D, M, F
    height: Number,
    preferredFoot: String,
    country: {
        alpha2: String,
        name: String
    },
    marketValue: Number,
    proposedMarketValue: Number,
    marketValueCurrency: String,
    userCount: Number,

    elementType: { type: Number, required: true, index: true }, // 1=GKP, 2=DEF, 3=MID, 4=FWD

    price: {
        nowCost: { type: Number, default: 50 }, // Default 5.0m
        costChangeStart: { type: Number, default: 0 },
        costChangeEvent: { type: Number, default: 0 }
    },

    status: {
        availability: {
            type: String,
            enum: ['a', 'd', 'i', 's', 'n', 'u'],
            default: 'a'
        },
        news: { type: String, default: '' },
        chancePlayingNextRound: Number,
        chancePlayingThisRound: Number
    },

    stats: { type: PlayerStatsSchema, default: {} },

    history: [PlayerHistorySchema]
}, { timestamps: true });

// Virtual to get the position name string
PlayerSchema.virtual('positionName').get(function (this: IPlayer) {
    const positions: Record<number, string> = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };
    return positions[this.elementType] || 'UNK';
});

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
