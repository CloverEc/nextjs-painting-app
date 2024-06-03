import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import multer from 'multer';
import { connectToDatabase } from '../../../lib/atlasdb';
import { Item } from '../../../models/Item';
import mongoose from 'mongoose';

const s3Client = new S3Client({
  region: process.env.AW_REGION,
  credentials: {
    accessKeyId: process.env.AW_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AW_SECRET_ACCESS_KEY!,
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadFile = async (file: Express.Multer.File) => {
  const params: PutObjectCommandInput = {
    Bucket: process.env.AW_S3_BUCKET_NAME!,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype!,
    ACL: 'public-read',
  };

  const command = new PutObjectCommand(params);
  const data = await s3Client.send(command);
  const fileUrl = `https://${params.Bucket}.s3.${process.env.AW_REGION}.amazonaws.com/${params.Key}`;
  return { ...data, Location: fileUrl };
};

const convertFieldsToProperTypes = (fields: { [key: string]: any }) => {
  const result: { [key: string]: any } = {};
  for (const key in fields) {
    if (Array.isArray(fields[key])) {
      result[key] = fields[key][0];
    } else {
      result[key] = fields[key];
    }

    if (key === 'publish') {
      result[key] = parseFloat(result[key]);
    }
  }
  return result;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      await connectToDatabase(process.env.MONGODB_URI!);

      const form = upload.fields([
        { name: 'nextImage', maxCount: 1 },
        { name: 'canvasImage', maxCount: 1 },
      ]);

      form(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to process files' });
        }

        const nextImageFile = req.files['nextImage'][0];
        const canvasImageFile = req.files['canvasImage'][0];

        if (!nextImageFile || !canvasImageFile) {
          return res.status(400).json({ error: 'Files are missing' });
        }

        const [nextImageResult, canvasImageResult] = await Promise.all([
          uploadFile(nextImageFile),
          uploadFile(canvasImageFile),
        ]);

        const fields = req.body;
        const properFields = convertFieldsToProperTypes(fields);

        const item = new Item({
          title: properFields.title || 'Untitled',
          prompt: properFields.prompt,
          medias: [nextImageResult.Location, canvasImageResult.Location],
          type: properFields.type,
          publish: properFields.publish,
          userId: new mongoose.Types.ObjectId(properFields.userId),
          status: properFields.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await item.save();

        return res.status(200).json({ result: item });
      });
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

