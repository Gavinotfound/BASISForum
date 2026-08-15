'use client';

import React from 'react';
import { Layout } from '@basis-forum/ui';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type ForumUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

export default function ClientLayout({ children, user }: { children: React.ReactNode; user?: ForumUser }) {
  const router = useRouter();

  return (
    <Layout 
      user={user} 
      onSignIn={() => router.push('/login')} 
      onSignOut={() => signOut()}
      onProfile={() => router.push('/profile')}
      onHome={() => router.push('/')}
      onBulletin={() => router.push('/bulletin')}
      onStudy={() => router.push('/study#updates')}
    >
      {children}
    </Layout>
  );
}
