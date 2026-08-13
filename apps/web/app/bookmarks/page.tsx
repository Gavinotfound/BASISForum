import React from 'react';
import Link from 'next/link';
import { BasisProvider, ThreadCard } from '@basis-forum/ui';
import { Box, Paper, Typography } from '@mui/material';
import { getBookmarkedThreads } from '@basis-forum/database';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ClientLayout from '../components/ClientLayout';

export const dynamic = 'force-dynamic';

export default async function BookmarksPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/login');

  const threads = await getBookmarkedThreads(userId);

  return (
    <BasisProvider>
      <ClientLayout user={session?.user}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>Saved Discussions</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Keep useful explanations and study threads ready for your next review session.</Typography>
        {threads.length === 0 ? (
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>No saved discussions yet</Typography>
            <Typography color="text.secondary">Open a discussion and choose Save to add it to this list.</Typography>
          </Paper>
        ) : (
          <Box>
            {threads.map((thread) => (
              <Link key={thread.id} href={`/threads/${thread.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                <ThreadCard title={thread.title} author="Student" category={thread.subject} replies={thread.reply_count} score={thread.vote_score} />
              </Link>
            ))}
          </Box>
        )}
      </ClientLayout>
    </BasisProvider>
  );
}
