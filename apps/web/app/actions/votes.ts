'use server';

import { createNotification, getCommentById, getThreadBySlug, toggleVote, type VoteTargetType } from '@basis-forum/database';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export type VoteActionResult = {
  error?: string;
  likes: number;
  dislikes: number;
  score: number;
  currentUserVote: 1 | -1 | 0;
};

export async function castVote(
  threadId: string,
  slug: string,
  targetType: VoteTargetType,
  targetId: string,
  value: 1 | -1,
): Promise<VoteActionResult> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return { error: '请先登录后再投票。', likes: 0, dislikes: 0, score: 0, currentUserVote: 0 };
  }

  if (targetType === 'thread' && targetId !== threadId) {
    return { error: '无效的主题投票目标。', likes: 0, dislikes: 0, score: 0, currentUserVote: 0 };
  }

  const thread = await getThreadBySlug(slug);
  if (!thread) {
    return { error: '该主题不存在。', likes: 0, dislikes: 0, score: 0, currentUserVote: 0 };
  }

  let recipientId = thread.authorId || undefined;
  if (targetType === 'comment') {
    const comment = await getCommentById(threadId, targetId);
    if (!comment) {
      return { error: '该评论不存在或不属于当前主题。', likes: 0, dislikes: 0, score: 0, currentUserVote: 0 };
    }
    recipientId = comment.authorId || undefined;
  }

  try {
    const summary = await toggleVote({ userId, targetType, targetId, value });
    if (recipientId && summary.currentUserVote !== 0) {
      await createNotification({
        userId: recipientId,
        actorId: userId,
        type: 'vote',
        targetType,
        targetId,
        threadId,
        message: `${session?.user?.name || 'A student'} ${summary.currentUserVote === 1 ? 'liked' : 'disliked'} your ${targetType === 'thread' ? 'discussion' : 'comment'}.`,
      });
    }
    revalidatePath(`/threads/${slug}`);
    return summary;
  } catch (error) {
    console.error('Vote update failed:', error);
    return { error: '投票失败，请稍后重试。', likes: 0, dislikes: 0, score: 0, currentUserVote: 0 };
  }
}
