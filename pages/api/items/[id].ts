import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/atlasdb';
import { Item } from '../../../models/Item';
import { useEffect, useState } from 'react';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase(process.env.MONGODB_URI!);

  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const objectId = new mongoose.Types.ObjectId(id as string);

  if (req.method === 'GET') {
    const item = await Item.findById(objectId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.status(200).json(item);
  }

  if (req.method === 'PUT') {
    const { title, prompt, medias, type, publish, status } = req.body;
    const item = await Item.findByIdAndUpdate(objectId, { title, prompt, medias, type, publish, status, updatedAt: new Date() }, { new: true });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.status(200).json(item);
  }

  if (req.method === 'DELETE') {
    const item = await Item.findByIdAndDelete(objectId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

