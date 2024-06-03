import { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  provider: string;
  providerId: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, required: true },
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
});

export const User = models.User || model<IUser>('User', userSchema);

