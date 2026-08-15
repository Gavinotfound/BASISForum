'use server';

import { randomUUID } from 'crypto';
import { createNotification, createPeerReview, createThread as dbCreateThread, createComment as dbCreateComment, getCommentById, getThreadBySlug } from '@basis-forum/database';
import { isThreadKind, safeEditorialUrl, shortText } from '@basis-forum/core';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ALLOWED_SUBJECTS = new Set([
  'Math',
  'Science',
  'History',
  'English',
  'Art',
  'Computer Science',
  'General',
]);

export type ThreadFormState = {
  error?: string;
};

function createSlug(title: string) {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);

  return `${base || 'discussion'}-${randomUUID().slice(0, 8)}`;
}

export async function postThread(_previousState: ThreadFormState, formData: FormData): Promise<ThreadFormState> {
  const session = await auth();
  const authorId = (session?.user as { id?: string } | undefined)?.id;

  if (!authorId) {
    return { error: '登录状态已失效，请重新登录后再发布。' };
  }

  const title = String(formData.get('title') || '').trim().replace(/\s+/g, ' ');
  const subject = String(formData.get('subject') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const kind = String(formData.get('kind') || 'discussion').trim();
  const assignment = shortText(String(formData.get('assignment') || ''), 180);
  const whatTried = shortText(String(formData.get('whatTried') || ''), 500);
  const dueWindow = shortText(String(formData.get('dueWindow') || ''), 80);
  const peerReviewRubric = [...new Set(String(formData.get('peerReviewRubric') || '').split(',').map((item) => shortText(item, 80)).filter(Boolean))].slice(0, 6);
  const peerReviewUrl = safeEditorialUrl(String(formData.get('peerReviewUrl') || ''));

  if (title.length < 4 || title.length > 120) {
    return { error: '标题需为 4 至 120 个字符。' };
  }

  if (!ALLOWED_SUBJECTS.has(subject)) {
    return { error: '请选择有效的学科分类。' };
  }

  if (!isThreadKind(kind)) {
    return { error: '请选择有效的讨论类型。' };
  }

  if (kind === 'help_request' && whatTried.length < 8) {
    return { error: '求助帖请简要说明你已经尝试过什么。' };
  }

  if (kind === 'review_request' && peerReviewRubric.length === 0) {
    return { error: '互评请求请提供至少一个评审维度。' };
  }

  if (content.length < 12 || content.length > 8000) {
    return { error: '正文需为 12 至 8,000 个字符。' };
  }

  let thread: { id: string; slug: string };
  try {
    thread = await dbCreateThread({
      title,
      subject,
      content,
      slug: createSlug(title),
      authorId,
      kind,
      helpContext: kind === 'help_request' ? { assignment: assignment || null, whatTried, dueWindow: dueWindow || null } : undefined,
    });
  } catch (error) {
    console.error('Thread publication failed:', error);
    return { error: '发布失败，请稍后重试。' };
  }

  if (kind === 'review_request') {
    try {
      await createPeerReview({ threadId: thread.id, requesterId: authorId, rubric: peerReviewRubric, externalUrl: peerReviewUrl });
    } catch (error) {
      console.error('Peer-review exchange creation failed:', error);
      return { error: '讨论已创建，但互评工作区未能初始化。请联系管理员。' };
    }
  }

  revalidatePath('/');
  revalidatePath('/study');
  redirect(`/threads/${thread.slug}`);
}

export type CommentFormState = {
  error?: string;
  success?: string;
  commentId?: string;
};

export async function postComment(
  threadId: string,
  slug: string,
  _previousState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const session = await auth();
  const authorId = (session?.user as { id?: string } | undefined)?.id;
  const content = String(formData.get('content') || '').trim();
  const parentId = String(formData.get('parentId') || '').trim() || null;

  if (!authorId) {
    return { error: '登录状态已失效，请重新登录后再回复。' };
  }

  if (content.length < 1 || content.length > 4000) {
    return { error: '回复需为 1 至 4,000 个字符。' };
  }

  let parentComment: Awaited<ReturnType<typeof getCommentById>> = null;
  let normalizedParentId = parentId;
  let replyContext: Record<string, unknown> | undefined;

  if (parentId) {
    parentComment = await getCommentById(threadId, parentId);
    if (!parentComment) {
      return { error: '你要回复的楼层已不存在或不属于该主题。' };
    }

    // Layer 1 is a floor; layer 2 is a reply to that floor. Any deeper reply is
    // flattened back onto the floor while retaining an explicit @author target.
    if (parentComment.parentId) {
      const floorComment = await getCommentById(threadId, parentComment.parentId);
      if (!floorComment) {
        return { error: '该回复所属的楼层已不存在。' };
      }
      normalizedParentId = floorComment.id;
      replyContext = {
        replyTo: {
          id: parentComment.id,
          authorName: parentComment.author?.name || parentComment.author?.username || 'Student',
          authorUsername: parentComment.author?.username || null,
          excerpt: parentComment.content.slice(0, 160),
        },
      };
    }
  }

  let comment: { id: string };
  try {
    comment = await dbCreateComment({
      threadId,
      authorId,
      content,
      parentId: normalizedParentId || undefined,
      metadata: replyContext,
    });
  } catch (error) {
    console.error('Comment publication failed:', error);
    return { error: '回复发布失败，请稍后重试。' };
  }

  try {
    const thread = await getThreadBySlug(slug);
    const recipientId = parentComment?.authorId || thread?.authorId;
    if (recipientId) {
      await createNotification({
        userId: recipientId,
        actorId: authorId,
        type: 'reply',
        targetType: 'comment',
        targetId: comment.id,
        threadId,
        message: `${session?.user?.name || 'A student'} replied to ${parentComment ? 'your comment' : 'your discussion'}.`,
      });
    }
  } catch (error) {
    console.error('Reply notification failed:', error);
  }

  revalidatePath(`/threads/${slug}`);
  return { success: '回复已发布。', commentId: comment.id };
}
