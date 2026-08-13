import React from 'react';
import { BasisProvider, ThreadForm } from '@basis-forum/ui';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { postThread } from '../actions/forum';
import ClientLayout from '../components/ClientLayout';

export const dynamic = 'force-dynamic';

const subjects = [
  'Math',
  'Science',
  'History',
  'English',
  'Art',
  'Computer Science',
  'General',
];

export default async function NewThreadPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <BasisProvider>
      <ClientLayout user={session.user}>
        <ThreadForm subjects={subjects} action={postThread} />
      </ClientLayout>
    </BasisProvider>
  );
}
