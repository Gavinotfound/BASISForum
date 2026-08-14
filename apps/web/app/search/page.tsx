import React from 'react';
import Link from 'next/link';
import { BasisProvider, ThreadCard } from '@basis-forum/ui';
import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { searchThreads, type ThreadSort } from '@basis-forum/database';
import { auth } from '@/auth';
import ClientLayout from '../components/ClientLayout';

export const dynamic = 'force-dynamic';

const subjects = ['All subjects', 'Math', 'Science', 'History', 'English', 'Art', 'Computer Science', 'General'];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; subject?: string; sort?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const query = params.q || '';
  const subject = subjects.includes(params.subject || '') && params.subject !== 'All subjects' ? params.subject : '';
  const sort: ThreadSort = params.sort === 'hot' ? 'hot' : 'latest';
  const threads = await searchThreads({ query, subject, sort });

  return (
    <BasisProvider>
      <ClientLayout user={session?.user}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>Find Study Discussions</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Search titles and discussion text, then filter by subject or sort by community hotness.</Typography>

        <Paper component="form" action="/search" sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: 3, mb: { xs: 2.5, md: 3 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 156px auto', lg: 'minmax(0, 1fr) 190px 150px auto' }, gap: 1.5 }}>
            <TextField name="q" label="Search discussions" defaultValue={query} placeholder="e.g. AP Biology cell respiration" />
            <TextField select name="subject" label="Subject" defaultValue={subject || 'All subjects'}>
              {subjects.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField select name="sort" label="Sort" defaultValue={sort} sx={{ gridColumn: { xs: 'auto', sm: '1 / span 1', lg: 'auto' } }}>
              <MenuItem value="latest">Latest</MenuItem>
              <MenuItem value="hot">Hot</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" sx={{ minWidth: { xs: '100%', sm: 'auto' }, gridColumn: { xs: 'auto', sm: '2 / span 2', lg: 'auto' } }}>Search</Button>
          </Box>
        </Paper>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>{threads.length} result{threads.length === 1 ? '' : 's'} found</Typography>
        {threads.length === 0 ? (
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}><Typography>No matching discussions yet.</Typography></Paper>
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
