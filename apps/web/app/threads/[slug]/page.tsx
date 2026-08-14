import React from 'react';
import { BasisProvider, CategoryBadge } from '@basis-forum/ui';
import { isDisplayMode } from '@basis-forum/ui/src/theme-config';
import { cookies } from 'next/headers';
import { Typography, Box } from '@mui/material';
import { getBookmarkStatus, getCommentsByThreadId, getThreadBySlug, getVoteSummaries } from '@basis-forum/database';
import { auth } from '@/auth';
import { postComment } from '../../actions/forum';
import { castVote } from '../../actions/votes';
import { submitReport } from '../../actions/community';
import ClientLayout from '../../components/ClientLayout';
import FloorDiscussion from '../../components/FloorDiscussion';
import VoteControls from '../../components/VoteControls';
import { BookmarkButton, ReportButton } from '../../components/CommunityControls';

export const dynamic = 'force-dynamic';

const emptyVote = { likes: 0, dislikes: 0, score: 0, currentUserVote: 0 as const };

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const requestedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = isDisplayMode(requestedMode) ? requestedMode : 'dark';
  const [session, thread] = await Promise.all([auth(), getThreadBySlug(slug)]);

  if (!thread) {
    return (
      <BasisProvider mode={mode}>
        <ClientLayout user={session?.user}>
          <Typography variant="h4">Thread not found</Typography>
        </ClientLayout>
      </BasisProvider>
    );
  }

  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  const [comments, bookmarked] = await Promise.all([
    getCommentsByThreadId(thread.id),
    getBookmarkStatus(currentUserId, thread.id),
  ]);
  const voteTargets = [
    { targetType: 'thread' as const, targetId: thread.id },
    ...comments.map((comment) => ({ targetType: 'comment' as const, targetId: comment.id })),
  ];
  const voteSummaries = await getVoteSummaries(voteTargets, currentUserId);

  const starterPost = comments.find((comment) => comment.is_thread_starter) || comments[0];
  const discussionComments = comments
    .filter((comment) => comment.id !== starterPost?.id)
    .map((comment) => ({
      ...comment,
      vote: voteSummaries.get(`comment:${comment.id}`) || emptyVote,
    }));
  const submitComment = postComment.bind(null, thread.id, slug);
  const submitVote = castVote.bind(null, thread.id, slug);
  const submitThreadReport = submitReport.bind(null, thread.id, 'thread', thread.id);
  const authorName = thread.author?.name || thread.author?.username || 'Student';
  const canInteract = Boolean(session?.user);

  return (
    <BasisProvider>
      <ClientLayout user={session?.user}>
        <Box component="article" sx={{ mb: 7, pt: 2, color: 'var(--bf-text)', borderTop: '2px solid var(--bf-text)' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '160px minmax(0,1fr)' }, gap: { xs: 1.5, md: 4 }, mb: 3 }}>
            <Box><CategoryBadge label={thread.subject} /><Typography variant="overline" sx={{ display: 'block', mt: 1, color: 'var(--bf-muted)' }}>POSTED BY / {authorName.toUpperCase()} / {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : 'TODAY'}</Typography></Box>
            <Typography variant="overline" sx={{ textAlign: { xs: 'left', md: 'right' }, color: 'var(--bf-muted)' }}>ORIGINAL POST / 001</Typography>
          </Box>
          <Typography variant="h2" sx={{ mb: 4, maxWidth: 1100, overflowWrap: 'anywhere', textTransform: 'uppercase' }}>{thread.title}</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.75, mb: 4, maxWidth: 760, color: 'var(--bf-text)' }}>{starterPost?.content || 'This discussion has no content yet.'}</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', pt: 1.5, borderTop: '1px solid var(--bf-divider)' }}>
            <VoteControls targetType="thread" targetId={thread.id} initialVote={voteSummaries.get(`thread:${thread.id}`) || emptyVote} action={submitVote} canVote={canInteract} />
            <BookmarkButton initialBookmarked={bookmarked} canBookmark={canInteract} threadId={thread.id} />
            <ReportButton canReport={canInteract} action={submitThreadReport} />
          </Box>
        </Box>

        <FloorDiscussion
          starterId={starterPost?.id}
          starterAuthor={authorName}
          comments={discussionComments}
          canReply={canInteract}
          action={submitComment}
          voteAction={submitVote}
          canVote={canInteract}
          reportAction={submitReport.bind(null, thread.id)}
        />
      </ClientLayout>
    </BasisProvider>
  );
}
