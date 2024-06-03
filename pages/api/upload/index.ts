import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import formidable, { File, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../../../lib/atlasdb';
import { Item, IItem } from '../../../models/Item'; // Import the Item model correctly
import mongoose from 'mongoose';

// Configure AWS SDK
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const convertFieldsToProperTypes = (fields: { [key: string]: any }) => {
  const result: { [key: string]: any } = {};
  for (const key in fields) {
    if (Array.isArray(fields[key])) {
      result[key] = fields[key][0]; // Convert array to single value
    } else {
      result[key] = fields[key];
    }

    // Cast fields to proper types
    if (key === 'publish') {
      result[key] = parseFloat(result[key]);
    }
  }
  return result;
};

const uploadFile = async (file: File) => {
  if (!file.filepath) {
    throw new Error('File path is undefined');
  }

  const fileContent = fs.readFileSync(file.filepath);
  const params: PutObjectCommandInput = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: file.newFilename, // Ensure unique file name in S3
    Body: fileContent,
    ContentType: file.mimetype!,
    ACL: 'public-read', // Set the object to be publicly readable
  };

  const command = new PutObjectCommand(params);
  const data = await s3Client.send(command);
  const fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
  return { ...data, Location: fileUrl };
};

const parseForm = (req: NextApiRequest): Promise<{ fields: Fields; files: Files }> => {
  const form = formidable({ multiples: true, uploadDir: path.join(process.cwd(), '/tmp'), keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err: any, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      await connectToDatabase(process.env.MONGODB_URI!); // Ensure database connection

      const { fields, files } = await parseForm(req);

      // Check if files are present
      const nextImageFile = Array.isArray(files.nextImage) ? files.nextImage[0] : files.nextImage;
      const canvasImageFile = Array.isArray(files.canvasImage) ? files.canvasImage[0] : files.canvasImage;

      if (!nextImageFile || !canvasImageFile) {
        return res.status(400).json({ error: 'Files are missing' });
      }

      const [nextImageResult, canvasImageResult] = await Promise.all([
        uploadFile(nextImageFile),
        uploadFile(canvasImageFile),
      ]);

      const properFields = convertFieldsToProperTypes(fields);

      const item = new Item({
        title: properFields.title || 'Untitled', // Ensure title is present
        prompt: properFields.prompt,
        medias: [nextImageResult.Location, canvasImageResult.Location],
        type: properFields.type,
        publish: properFields.publish,
        userId: new mongoose.Types.ObjectId(properFields.userId), // Ensure userId is an ObjectId
        status: properFields.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await item.save();

      return res.status(200).json({ result: item });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to upload files' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
};

export default handler;

