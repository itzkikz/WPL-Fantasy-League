import mongoose, { Document, Schema } from 'mongoose';

export interface IFixture extends Document {
  fixtureId: number;
  eventState: Record<string, any>;
  tournament: { id: number };
  uniqueTournament: { id: number };
  season: { id: number };
  roundInfo: { round: number };
  status: { code: number; description: string; type: string };
  winnerCode: number;
  homeTeam: { id: number };
  awayTeam: { id: number };
  homeScore: { current?: number; display?: number; period1?: number; period2?: number; normaltime?: number };
  awayScore: { current?: number; display?: number; period1?: number; period2?: number; normaltime?: number };
  time: { injuryTime1?: number; injuryTime2?: number; currentPeriodStartTimestamp?: number };
  slug: string;
  startTimestamp: number;
  isEditor: boolean;
  hasEventPlayerStatistics: boolean;
}

const FixtureSchema: Schema = new Schema({
  fixtureId: { type: Number, required: true, unique: true },
  eventState: { type: Schema.Types.Mixed, default: {} },
  tournament: {
    id: { type: Number }
  },
  uniqueTournament: {
    id: { type: Number }
  },
  season: {
    id: { type: Number }
  },
  roundInfo: {
    round: { type: Number }
  },
  status: {
    code: { type: Number },
    description: { type: String },
    type: { type: String }
  },
  winnerCode: { type: Number },
  homeTeam: {
    id: { type: Number }
  },
  awayTeam: {
    id: { type: Number }
  },
  homeScore: {
    current: { type: Number },
    display: { type: Number },
    period1: { type: Number },
    period2: { type: Number },
    normaltime: { type: Number }
  },
  awayScore: {
    current: { type: Number },
    display: { type: Number },
    period1: { type: Number },
    period2: { type: Number },
    normaltime: { type: Number }
  },
  time: {
    injuryTime1: { type: Number },
    injuryTime2: { type: Number },
    currentPeriodStartTimestamp: { type: Number }
  },
  slug: { type: String },
  startTimestamp: { type: Number },
  isEditor: { type: Boolean },
  hasEventPlayerStatistics: { type: Boolean }
}, { timestamps: true });

export const Fixture = mongoose.model<IFixture>('Fixture', FixtureSchema);
