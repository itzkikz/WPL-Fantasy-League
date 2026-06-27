import mongoose, { Document, Schema } from 'mongoose';

export interface IFixture extends Document {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: Date;
    timestamp: number;
    periods: {
      first: number;
      second: number;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number;
      extra: string | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
    standings: boolean;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

const FixtureSchema: Schema = new Schema({
  fixture: {
    id: { type: Number, required: true, unique: true },
    referee: { type: String },
    timezone: { type: String },
    date: { type: Date },
    timestamp: { type: Number },
    periods: {
      first: { type: Number },
      second: { type: Number }
    },
    venue: {
      id: { type: Number },
      name: { type: String },
      city: { type: String }
    },
    status: {
      long: { type: String },
      short: { type: String },
      elapsed: { type: Number },
      extra: { type: String, default: null }
    }
  },
  league: {
    id: { type: Number },
    name: { type: String },
    country: { type: String },
    logo: { type: String },
    flag: { type: String },
    season: { type: Number },
    round: { type: String },
    standings: { type: Boolean }
  },
  teams: {
    home: {
      id: { type: Number },
      name: { type: String },
      logo: { type: String },
      winner: { type: Boolean, default: null }
    },
    away: {
      id: { type: Number },
      name: { type: String },
      logo: { type: String },
      winner: { type: Boolean, default: null }
    }
  },
  goals: {
    home: { type: Number, default: null },
    away: { type: Number, default: null }
  },
  score: {
    halftime: {
      home: { type: Number, default: null },
      away: { type: Number, default: null }
    },
    fulltime: {
      home: { type: Number, default: null },
      away: { type: Number, default: null }
    },
    extratime: {
      home: { type: Number, default: null },
      away: { type: Number, default: null }
    },
    penalty: {
      home: { type: Number, default: null },
      away: { type: Number, default: null }
    }
  }
}, { timestamps: true });

export const Fixture = mongoose.model<IFixture>('Fixture', FixtureSchema);
