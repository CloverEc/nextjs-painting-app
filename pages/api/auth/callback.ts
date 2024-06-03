// pages/api/auth/callback.ts
import type { NextApiRequest, NextApiResponse } from 'next';



const authCallback = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { user, account, profile } = req.body;


    // Save user data to your backend
    const response = await fetch(`${process.env.BACKEND_URL}/save-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, account, profile }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default authCallback;
