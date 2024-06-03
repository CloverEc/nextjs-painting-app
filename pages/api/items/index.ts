
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/atlasdb';
import { Item } from '../../../models/Item';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase(process.env.MONGODB_URI!);

  if (req.method === 'GET') {
	  const publishedItems = await Item.find({ publish: true });
	  res.status(200).json(publishedItems);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

