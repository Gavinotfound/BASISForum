'use server';

import { createNotification, resolveReport } from '@basis-forum/database';
import { isModerationRole } from '@basis-forum/core';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function reviewReport(
  reportId: string,
  reporterId: string,
  threadId: string,
  status: 'reviewed' | 'dismissed' | 'actioned',
  resolutionNote?: string,
) {
  const session = await auth();
  const moderator = session?.user as { id?: string; name?: string; role?: string } | undefined;

  if (!moderator?.id || !isModerationRole(moderator.role)) {
    throw new Error('Unauthorized moderation action');
  }

  await resolveReport({ reportId, moderatorId: moderator.id, status, resolutionNote });
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
