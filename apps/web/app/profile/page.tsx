import React from 'react';
import { BasisProvider } from '@basis-forum/ui';
import { getUserProfile } from '@basis-forum/database';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ClientLayout from '../components/ClientLayout';
import ProfileEditor from '../components/ProfileEditor';
import { saveProfile } from '../actions/community';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/login');

  const profile = await getUserProfile(userId);
  if (!profile) redirect('/login');

  return (
    <BasisProvider>
      <ClientLayout user={session?.user}>
        <ProfileEditor profile={profile} action={saveProfile} />
      </ClientLayout>
    </BasisProvider>
  );
}
