import { Schema, model, models, Document } from 'mongoose';

export interface IItem extends Document {
  title: string;
  prompt: string;
  medias: string[];
  type: number;
  publish: number;
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  status: string;
}

const itemSchema = new Schema<IItem>({
  title: { type: String, required: true },
  prompt: { type: String, required: true },
  medias: { type: [String], required: true },
  type: { type: Number, required: true },
  publish: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, required: true },
});

export const Item = models.Item || model<IItem>('Item', itemSchema);
