import mongoose, { Document, Schema } from 'mongoose';

export interface ISeason extends Document {
    name: string; // "2024/25"
    id: number; // FPL style season ID, or incremental
    isCurrent: boolean;
    startDate: Date;
    endDate: Date;
}

const SeasonSchema: Schema = new Schema({
    name: { type: String, required: true },
    id: { type: Number, required: true, unique: true },
    isCurrent: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date }
}, { timestamps: true });

// Ensure only one season is marked as current
SeasonSchema.pre('save', async function () {
    if (this.isCurrent) {
        await mongoose.model('Season').updateMany(
            { _id: { $ne: this._id } },
            { $set: { isCurrent: false } }
        );
    }
});

export const Season = mongoose.model<ISeason>('Season', SeasonSchema);
