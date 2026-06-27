import mongoose, { Document, Schema } from 'mongoose';

export interface IGameweek extends Document {
  number: number;
  fixtures: number[]; // Array of Fixture IDs
  isCurrent: boolean;
  isNext: boolean;
  isCompleted: boolean;
  startDate: Date;
  endDate: Date;
  season: number; // Refers to Season ID
}

const GameweekSchema: Schema = new Schema({
  number: { type: Number, required: true },
  fixtures: [{ type: Number }], // Storing fixture IDs instead of ObjectIds since Fixture model uses numerical IDs
  isCurrent: { type: Boolean, default: false },
  isNext: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  season: { type: Number, required: true },
}, { timestamps: true });

// Ensure only one gameweek is marked as current per season
GameweekSchema.pre('save', async function () {
  if (this.isCurrent) {
    await mongoose.model('Gameweek').updateMany(
      { _id: { $ne: this._id }, season: this.season },
      { $set: { isCurrent: false } }
    );
  }
  if (this.isNext) {
    await mongoose.model('Gameweek').updateMany(
      { _id: { $ne: this._id }, season: this.season },
      { $set: { isNext: false } }
    );
  }
});

export const Gameweek = mongoose.model<IGameweek>('Gameweek', GameweekSchema);
