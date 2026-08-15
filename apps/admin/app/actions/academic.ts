'use server';

import { createStudyHub, publishStudyHub, reviewKnowledgeCard, setMentorProfileStatus } from '@basis-forum/database';
import { isModerationRole } from '@basis-forum/core';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function requireModerator() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || !isModerationRole(user.role)) throw new Error('Moderator access is required.');
  return { ...user, id: user.id } as { id: string; role?: string };
}

export async function createStudyHubAction(input: { subject: string; title: string; description: string; startsAt: string; endsAt: string }) {
  const user = await requireModerator();
  if (user.role !== 'admin') throw new Error('Only administrators can create study hubs.');
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  const title = input.title.trim().slice(0, 120);
  const description = input.description.trim();
  if (title.length < 4 || description.length < 20 || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) throw new Error('Provide a valid hub title, description, and time window.');
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'study-hub'}-${crypto.randomUUID().slice(0, 8)}`;
  const hub = await createStudyHub({ slug, subject: input.subject.trim().slice(0, 60), title, description, startsAt, endsAt, createdBy: user.id });
  revalidatePath('/admin');
  return hub;
}

export async function reviewKnowledgeCardAction(input: { cardId: string; decision: 'publish' | 'return' | 'archive' }) {
  const user = await requireModerator();
  const status = input.decision === 'publish' ? 'published' : input.decision === 'archive' ? 'archived' : 'draft';
  const card = await reviewKnowledgeCard({ cardId: input.cardId, status, reviewedBy: user.id });
  revalidatePath('/');
  revalidatePath('/knowledge');
  revalidatePath('/admin');
  return card;
}

export async function reviewStudyHubAction(input: { hubId: string; decision: 'publish' | 'archive' }) {
  const user = await requireModerator();
  if (user.role !== 'admin') throw new Error('Only administrators can publish study hubs.');
  const hub = await publishStudyHub(input.hubId, user.id, input.decision === 'publish' ? 'published' : 'archived');
  revalidatePath('/study');
  revalidatePath('/admin');
  return hub;
}

export async function reviewMentorProfileAction(input: { profileId: string; decision: 'verify' | 'decline' | 'suspend'; note?: string }) {
  const user = await requireModerator();
  if (user.role !== 'admin') throw new Error('Only administrators can verify mentor profiles.');
  const status = input.decision === 'verify' ? 'verified' : input.decision === 'suspend' ? 'suspended' : 'declined';
  const profile = await setMentorProfileStatus({ profileId: input.profileId, status, reviewedBy: user.id, reviewNote: input.note });
  revalidatePath('/study');
  revalidatePath('/admin');
  return profile;
}
