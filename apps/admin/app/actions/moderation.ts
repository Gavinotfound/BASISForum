'use server';

import { createModerationLog, createNotification, resolveReport, setThreadSticky, setUserRole } from '@basis-forum/database';
import { isModerationRole } from '@basis-forum/core';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

type ModeratorSession = { id?: string; name?: string; role?: string };
type ManagedRole = 'student' | 'moderator';

async function requireModerator(): Promise<ModeratorSession & { id: string }> {
  const session = await auth();
  const moderator = session?.user as ModeratorSession | undefined;
  if (!moderator?.id || !isModerationRole(moderator.role)) throw new Error('Unauthorized moderation action');
  return moderator as ModeratorSession & { id: string };
}

export async function reviewReport(
  reportId: string,
  reporterId: string,
  threadId: string,
  status: 'reviewed' | 'dismissed' | 'actioned',
  resolutionNote?: string,
) {
  const moderator = await requireModerator();

  await resolveReport({ reportId, moderatorId: moderator.id, status, resolutionNote });
  await createModerationLog({ moderatorId: moderator.id, targetType: 'report', targetId: reportId, action: `report_${status}`, reason: resolutionNote });
  await createNotification({
    userId: reporterId,
    actorId: moderator.id,
    type: 'report_update',
    targetType: 'thread',
    targetId: threadId,
    threadId,
    message: `${moderator.name || 'A moderator'} ${status === 'dismissed' ? 'dismissed' : 'reviewed'} your report.`,
  });

  revalidatePath('/');
}

export async function setThreadPinnedAction(threadId: string, isSticky: boolean) {
  const moderator = await requireModerator();
  const thread = await setThreadSticky({ threadId, isSticky });
  if (!thread) throw new Error('Discussion not found');

  await createModerationLog({
    moderatorId: moderator.id,
    targetType: 'thread',
    targetId: threadId,
    action: isSticky ? 'pin' : 'unpin',
    reason: isSticky ? 'Pinned from the Admin overview.' : 'Unpinned from the Admin overview.',
  });

  revalidatePath('/');
  revalidatePath(`/threads/${thread.slug}`);
  return { id: thread.id, isSticky: Boolean(thread.isSticky) };
}

export async function setMemberRoleAction(userId: string, role: ManagedRole) {
  const moderator = await requireModerator();
  if (moderator.role !== 'admin') throw new Error('Only administrators can change member roles');
  if (moderator.id === userId) throw new Error('Administrators cannot change their own role here');
  if (role !== 'student' && role !== 'moderator') throw new Error('Unsupported member role');

  const member = await setUserRole({ userId, role });
  if (!member) throw new Error('Member not found');

  await createModerationLog({ moderatorId: moderator.id, targetType: 'user', targetId: userId, action: 'role_change', reason: `Role changed to ${role}.` });
  await createNotification({
    userId,
    actorId: moderator.id,
    type: 'moderation_update',
    targetType: 'user',
    targetId: userId,
    message: `${moderator.name || 'An administrator'} updated your community role to ${role}.`,
  });

  revalidatePath('/');
  return { id: member.id, role: member.role || 'student' };
}
