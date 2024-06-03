// app/login/ClientLogin.tsx
'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function ClientLogin() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <div>
        Not signed in <br />
        <button onClick={() => signIn('google')}>Sign in with Google</button>
      </div>
    );
  }

  return (
    <div>
      Signed in as {session.user?.email} <br />
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}

