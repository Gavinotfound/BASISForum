'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import VoteControls from './VoteControls';
import { ReportButton } from './CommunityControls';
import type { VoteTargetType } from '@basis-forum/database';
import { useLanguage } from '@basis-forum/ui';

type ReplyContext = {
  replyTo?: {
    id?: string;
    authorName?: string;
    authorUsername?: string | null;
    excerpt?: string;
  };
};

type FloorComment = {
  id: string;
  parent_id?: string;
  author_name: string;
  author_username?: string;
  content: string;
  created_at: string;
  metadata?: unknown;
  vote: { likes: number; dislikes: number; score: number; currentUserVote: 1 | -1 | 0 };
};

const readReplyContext = (metadata: unknown): ReplyContext['replyTo'] | undefined => {
  if (!metadata || typeof metadata !== 'object') return undefined;
  const replyTo = (metadata as { replyTo?: unknown }).replyTo;
  if (!replyTo || typeof replyTo !== 'object') return undefined;

  const candidate = replyTo as { id?: unknown; authorName?: unknown; authorUsername?: unknown; excerpt?: unknown };
  return {
    id: typeof candidate.id === 'string' ? candidate.id : undefined,
    authorName: typeof candidate.authorName === 'string' ? candidate.authorName : undefined,
    authorUsername: typeof candidate.authorUsername === 'string' || candidate.authorUsername === null ? candidate.authorUsername : undefined,
    excerpt: typeof candidate.excerpt === 'string' ? candidate.excerpt : undefined,
  };
};

type ReplyState = { error?: string; success?: string; commentId?: string };
type ReplyTarget = { id: string; label: string } | null;

type FloorDiscussionProps = {
  starterId?: string;
  starterAuthor: string;
  comments: FloorComment[];
  canReply: boolean;
  action: (previousState: ReplyState, formData: FormData) => Promise<ReplyState>;
  voteAction: (targetType: VoteTargetType, targetId: string, value: 1 | -1) => Promise<{ likes: number; dislikes: number; score: number; currentUserVote: 1 | -1 | 0; error?: string }>;
  canVote: boolean;
  reportAction: (targetType: 'thread' | 'comment', targetId: string, state: ReplyState, formData: FormData) => Promise<ReplyState>;
};

export default function FloorDiscussion({ starterId, starterAuthor, comments, canReply, action, voteAction, canVote, reportAction }: FloorDiscussionProps) {
  const [state, formAction, isPending] = React.useActionState(action, {});
  const [replyTarget, setReplyTarget] = useState<ReplyTarget>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!state.success) return;
    window.location.hash = state.commentId ? `comment-${state.commentId}` : 'reply-composer';
    window.location.reload();
  }, [state.commentId, state.success]);

  const { topLevelComments, childrenByParent, flattenedContext } = useMemo(() => {
    const byId = new Map(comments.map((comment) => [comment.id, comment]));
    const children = new Map<string, FloorComment[]>();
    const topLevel: FloorComment[] = [];
    const context = new Map<string, ReplyContext['replyTo']>();

    for (const comment of comments) {
      let normalizedParentId = comment.parent_id;
      const directParent = comment.parent_id ? byId.get(comment.parent_id) : undefined;
      const metadataReplyTo = readReplyContext(comment.metadata);
      const parentIsFloor = Boolean(directParent && (!directParent.parent_id || directParent.parent_id === starterId));

      // A normal second-layer reply remains beneath its selected floor. Only legacy
      // third-or-deeper records are lifted to the floor and receive an @author context.
      if (metadataReplyTo) {
        context.set(comment.id, metadataReplyTo);
      } else if (directParent && !parentIsFloor && directParent.parent_id) {
        normalizedParentId = directParent.parent_id;
        context.set(comment.id, {
          id: directParent.id,
          authorName: directParent.author_name,
          authorUsername: directParent.author_username,
          excerpt: directParent.content.slice(0, 160),
        });
      }

      if (!normalizedParentId || normalizedParentId === starterId) {
        topLevel.push(comment);
        continue;
      }

      const group = children.get(normalizedParentId) || [];
      group.push(comment);
      children.set(normalizedParentId, group);
    }

    return { topLevelComments: topLevel, childrenByParent: children, flattenedContext: context };
  }, [comments, starterId]);

  const selectReplyTarget = (id: string, label: string) => {
    setReplyTarget({ id, label });
    window.setTimeout(() => document.getElementById('reply-composer')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  };

  const renderComment = (comment: FloorComment, floor: number, depth: 0 | 1) => {
    const children = depth === 0 ? childrenByParent.get(comment.id) || [] : [];
    const replyTo = flattenedContext.get(comment.id);
    const label = depth === 0 ? `#${floor}` : t('discussion.replyTo', { floor });

    return <Box key={comment.id} id={`comment-${comment.id}`} sx={{ ml: { xs: depth ? 1 : 0, sm: depth ? 1.5 : 0, md: depth ? 3 : 0 }, mt: depth ? { xs: 1, md: 1.5 } : 0, position: 'relative', '&:before': depth ? { content: '""', position: 'absolute', left: { xs: -8, sm: -11 }, top: 0, bottom: 0, width: 1, bgcolor: 'var(--bf-divider)' } : {} }}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2.25, md: 2.75 }, bgcolor: 'transparent', color: 'var(--bf-text)', backgroundImage: 'none', backdropFilter: 'none', borderTop: '1px solid var(--bf-divider)', borderLeft: depth ? '1px solid var(--bf-divider)' : 'none', transition: 'background-color 120ms linear', '&:hover': { bgcolor: 'var(--bf-hover)' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: { xs: 1, md: 2 }, alignItems: 'flex-start', mb: { xs: 1.25, md: 1.75 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
            <Typography variant="overline" sx={{ color: depth ? 'var(--bf-muted)' : 'var(--bf-text)', minWidth: 34 }}>{depth === 0 ? `#${floor}` : '↳'}</Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{comment.author_name}</Typography>
              <Typography variant="caption" color="text.secondary">{label} · {comment.created_at ? new Date(comment.created_at).toLocaleString() : t('discussion.justNow')}</Typography>
            </Box>
          </Box>
          {canReply ? <Button size="small" onClick={() => selectReplyTarget(comment.id, `${label} · ${comment.author_name}`)}>{t('discussion.reply')}</Button> : null}
        </Box>
        {replyTo?.authorName ? <Box component="aside" aria-label={`Replying to ${replyTo.authorName}`} sx={{ mb: 1.25, pl: 1.25, borderLeft: '2px solid var(--bf-interactive)', color: 'var(--bf-muted)' }}><Typography variant="overline" sx={{ display: 'block', color: 'inherit' }}>{`IN REPLY TO @${replyTo.authorName.toUpperCase()}`}</Typography><Typography variant="caption" sx={{ display: 'block', color: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.excerpt ? `“${replyTo.excerpt}”` : 'A previous reply in this floor.'}</Typography></Box> : null}
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.78, mb: 2, color: 'var(--bf-text)' }}>
          {comment.content}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          <VoteControls targetType="comment" targetId={comment.id} initialVote={comment.vote} action={voteAction} canVote={canVote} compact />
          <ReportButton canReport={canVote} action={reportAction.bind(null, 'comment', comment.id)} compact />
        </Box>
      </Paper>
      {children.map((child) => renderComment(child, floor, 1))}
    </Box>;
  };

  return <Box>
    <Box id="reply-composer" sx={{ mb: { xs: 3, md: 4 } }}>
      {canReply ? <Paper variant="outlined" sx={{ py: { xs: 2, sm: 2.5, md: 3.5 }, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)', bgcolor: 'transparent', backgroundImage: 'none', backdropFilter: 'none' }}>
        <Typography variant="overline" sx={{ display: 'block', color: 'var(--bf-muted)', mb: 1 }}>{t('discussion.add')}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>{replyTarget ? t('discussion.replying', { target: replyTarget.label }) : t('discussion.join')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{replyTarget ? t('discussion.selectedHelp') : t('discussion.directHelp', { author: starterAuthor })}</Typography>
        <Box component="form" action={formAction} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <input type="hidden" name="parentId" value={replyTarget?.id || ''} />
          <textarea name="content" required minLength={1} maxLength={4000} rows={4} placeholder={replyTarget ? t('discussion.replyPlaceholder', { target: replyTarget.label }) : t('discussion.placeholder')} />
          {state.error ? <Typography role="alert" variant="body2" color="error">{state.error}</Typography> : null}
          {state.success ? <Typography role="status" variant="body2" sx={{ color: 'var(--bf-muted)' }}>{state.success}</Typography> : null}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button type="submit" variant="contained" disabled={isPending}>{isPending ? t('discussion.posting') : t('discussion.postReply')}</Button>
            {replyTarget ? <Button type="button" variant="text" onClick={() => setReplyTarget(null)}>{t('discussion.replyToThread')}</Button> : null}
          </Box>
        </Box>
      </Paper> : <Paper variant="outlined" sx={{ py: 3, textAlign: 'center', bgcolor: 'transparent', borderTop: '1px solid var(--bf-divider)', borderBottom: '1px solid var(--bf-divider)' }}><Typography variant="body2">{t('discussion.signIn')}</Typography></Paper>}
    </Box>

    <Typography variant="h5" sx={{ mb: 2.25, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.1 }}>{t('discussion.floors')} <Box component="span" sx={{ color: 'var(--bf-muted)', fontSize: 14 }}>{String(topLevelComments.length).padStart(2, '0')}</Box></Typography>
    {topLevelComments.length === 0 ? <Typography variant="body1" color="text.secondary">{t('discussion.none')}</Typography> : <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{topLevelComments.map((comment, index) => renderComment(comment, index + 1, 0))}</Box>}
  </Box>;
}
