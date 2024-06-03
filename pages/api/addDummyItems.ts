import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/atlasdb';
import { Item } from '../../models/Item';
import dotenv from 'dotenv';

dotenv.config();

const dummyItems = [
  {
    title: 'Item 1',
    prompt: 'A girl open mouth',
    medias: ['/images/image1.png','/images/image2.png'],
    type: 1,
    publish: 1,
    userId: '6656b0daf567ad00e8f76cc5', // You can specify a user ID if needed
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
  },
  {
    title: 'Item 1',
    prompt: 'A girl open mouth',
    medias: ['/images/image11.png','/images/image12.png'],
    type: 3,
    publish: 1,
    userId: '6656b0daf567ad00e8f76cc5', // You can specify a user ID if needed
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await connectToDatabase(process.env.MONGODB_URI!);

      await Item.deleteMany({}); // Optional: Clear the collection before adding dummy items
      await Item.insertMany(dummyItems);

      return res.status(200).json({ message: 'Dummy items added successfully' });
    } catch (error:any) {
      return res.status(500).json({ error: 'Error adding dummy items', details: error?.message });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
