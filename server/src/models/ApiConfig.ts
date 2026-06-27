import mongoose, { Document, Schema } from 'mongoose';

export interface IApiConfig extends Document {
    key: string;
    lastUpdated: Date;
    lastUpdatedString: string;
    deadlineDate?: Date;
}

const ApiConfigSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    lastUpdated: { type: Date, required: true },
    lastUpdatedString: { type: String, required: true },
    deadlineDate: { type: Date }
}, { timestamps: true });

export const ApiConfig = mongoose.model<IApiConfig>('ApiConfig', ApiConfigSchema);
