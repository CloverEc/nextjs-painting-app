import mongoose, { Connection } from 'mongoose';

let cachedDb: Connection | null = null;

const connectToDatabase = async (uri: string): Promise<Connection> => {
  if (cachedDb) {
    return cachedDb;
  }

  await mongoose.connect(uri);

  cachedDb = mongoose.connection;
  return cachedDb;
};

export { connectToDatabase }
