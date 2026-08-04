import mongoose, { Document, Schema } from 'mongoose';

export interface IFact extends Document {
  headline: string;
  content?: string;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FactSchema: Schema = new Schema(
  {
    headline: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    category: { type: String, default: 'Trivia', trim: true },
    imageUrl: { type: String, default: '' },
    isPublished: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Fact = mongoose.model<IFact>('Fact', FactSchema);
