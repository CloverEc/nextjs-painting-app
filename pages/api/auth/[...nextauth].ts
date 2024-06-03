// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import { useEffect, useState } from 'react';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDatabase } from '../../../lib/atlasdb';
import { User } from '../../../models/User';

type ClientType = {
  clientId: string;
  clientSecret: string;
};

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    } as ClientType),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      await connectToDatabase(process.env.MONGODB_URI!);

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        const newUser = new User({
          name: user.name!,
          email: user.email!,
          image: user.image!,
          provider: account?.provider!,
          providerId: account?.providerAccountId!,
        });

        await newUser.save();
      }

      return true;
    },
    async session({ session, token }) {
      await connectToDatabase(process.env.MONGODB_URI!);
      const existingUser = await User.findOne({ email: session.user.email });

      if (existingUser) {
        session.user.id = existingUser._id;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);

