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
      onSearch={() => router.push('/search')}
      onProfile={() => router.push('/profile')}
      onBookmarks={() => router.push('/bookmarks')}
      onNotifications={() => router.push('/notifications')}
      onHome={() => router.push('/')}
      onBulletin={() => router.push('/bulletin')}
      onCreatorDesk={() => router.push('/creator')}
      onStudy={() => router.push('/study')}
      onKnowledge={() => router.push('/knowledge')}
    >
      {children}
    </Layout>
  );
}
