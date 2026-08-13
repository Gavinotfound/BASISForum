'use server';

import {
  createReport,
  getCommentById,
  getThreadById,
  markNotificationsRead,
  toggleBookmark,
  updateUserProfile,
} from '@basis-forum/database';
import { clampProfileSubjects, REPORT_REASONS } from '@basis-forum/core';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export type CommunityActionState = { error?: string; success?: string };

const currentUserId = async () => (await auth())?.user as { id?: string } | undefined;

export async function saveProfile(_previousState: CommunityActionState, formData: FormData): Promise<CommunityActionState> {
  const user = await currentUserId();
  if (!user?.id) return { error: '请先登录后再编辑学习档案。' };

  const name = String(formData.get('name') || '').trim();
  const username = String(formData.get('username') || '').trim();
  const bio = String(formData.get('bio') || '').trim();
  const school = String(formData.get('school') || '').trim();
  const grade = String(formData.get('grade') || '').trim();
  const favoriteSubjects = clampProfileSubjects(formData.getAll('subjects').map(String));

  if (name.length < 2 || name.length > 60) return { error: '姓名需为 2 至 60 个字符。' };
  if (username.length < 2 || username.length > 30) return { error: '用户名需为 2 至 30 个字符。' };
  if (bio.length > 500) return { error: '个人简介不能超过 500 个字符。' };

  try {
    await updateUserProfile(user.id, { name, username, bio, school, grade, favoriteSubjects });
    revalidatePath('/profile');
    revalidatePath('/');
    return { success: '学习档案已保存。' };
  } catch (error) {
    console.error('Profile update failed:', error);
    return { error: '保存失败：该用户名可能已被占用。' };
  }
}

export async function toggleBookmarkAction(threadId: string) {
  const user = await currentUserId();
  if (!user?.id) return { error: '请先登录后再收藏。', bookmarked: false };
  const thread = await getThreadById(threadId);
  if (!thread) return { error: '该主题不存在。', bookmarked: false };

  const result = await toggleBookmark(user.id, threadId);
  revalidatePath('/bookmarks');
  revalidatePath(`/threads/${thread.slug}`);
  return result;
}

export async function submitReport(
  threadId: string,
  targetType: 'thread' | 'comment',
  targetId: string,
  _previousState: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const user = await currentUserId();
  if (!user?.id) return { error: '请先登录后再举报。' };

  const thread = await getThreadById(threadId);
  if (!thread) return { error: '该主题不存在。' };
  if (targetType === 'thread' && targetId !== threadId) return { error: '无效的举报目标。' };
  if (targetType === 'comment' && !(await getCommentById(threadId, targetId))) return { error: '该评论不存在。' };

  const reason = String(formData.get('reason') || '').trim();
  const details = String(formData.get('details') || '').trim();
  if (!REPORT_REASONS.includes(reason as (typeof REPORT_REASONS)[number])) return { error: '请选择有效的举报原因。' };
  if (details.length > 1000) return { error: '补充说明不能超过 1,000 个字符。' };

  await createReport({ reporterId: user.id, targetType, targetId, threadId, reason, details: details || undefined });
  revalidatePath(`/threads/${thread.slug}`);
  return { success: '举报已提交，管理员会尽快审核。' };
}

export async function markNotificationsReadAction() {
  const user = await currentUserId();
  if (!user?.id) return;
  await markNotificationsRead(user.id);
  revalidatePath('/notifications');
}
