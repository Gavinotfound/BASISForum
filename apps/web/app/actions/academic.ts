'use server';

import {
  createKnowledgeCardDraft,
  createPeerReview,
  createStudyCircle,
  getThreadBySlug,
  leavePeerReviewFeedback,
  requestMentorProfile,
  requestMentorSupport,
  requestStudyCircle,
  resolveThreadWithReply,
  toggleUserBlock,
} from '@basis-forum/database';
import { clampProfileSubjects, safeCampusLocation, safeEditorialUrl, shortText } from '@basis-forum/core';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

type Actor = { id?: string; role?: string };
const requireActor = async (): Promise<Actor & { id: string }> => {
  const session = await auth();
  const actor = session?.user as Actor | undefined;
  if (!actor?.id) throw new Error('Sign in to continue.');
  return actor as Actor & { id: string };
};

export async function toggleMemberBlock(targetUserId: string) {
  const actor = await requireActor();
  if (actor.id === targetUserId) throw new Error('You cannot block your own account.');
  const result = await toggleUserBlock(actor.id, targetUserId);
  revalidatePath('/profile');
  return result;
}

export async function acceptHelpfulReply(input: { threadId: string; threadSlug: string; replyId: string }) {
  const actor = await requireActor();
  const thread = await getThreadBySlug(input.threadSlug);
  if (!thread || thread.id !== input.threadId) throw new Error('Discussion not found.');
  if (thread.authorId !== actor.id && actor.role !== 'admin' && actor.role !== 'moderator') throw new Error('Only the question author or a moderator can mark an answer as resolved.');
  const resolution = await resolveThreadWithReply({ threadId: input.threadId, replyId: input.replyId, resolvedBy: actor.id });
  revalidatePath(`/threads/${input.threadSlug}`);
  revalidatePath('/');
  return resolution;
}

export async function createCircle(input: { subject: string; title: string; description: string; startsAt: string; endsAt: string; capacity: number; locationLabel?: string }) {
  const actor = await requireActor();
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) throw new Error('Use a valid study-circle time window.');
  if (!Number.isInteger(input.capacity) || input.capacity < 2 || input.capacity > 12) throw new Error('Study circles support 2 to 12 students.');
  const title = shortText(input.title, 100);
  const description = input.description.trim();
  if (title.length < 4 || description.length < 20) throw new Error('Provide a clearer title and description.');
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'study-circle'}-${crypto.randomUUID().slice(0, 8)}`;
  const circle = await createStudyCircle({ slug, hostId: actor.id, subject: shortText(input.subject, 60), title, description, startsAt, endsAt, capacity: input.capacity, locationLabel: input.locationLabel ? safeCampusLocation(input.locationLabel) : undefined });
  revalidatePath('/study');
  return circle;
}

export async function joinStudyCircle(circleId: string, note?: string) {
  const actor = await requireActor();
  const request = await requestStudyCircle(circleId, actor.id, shortText(note || '', 300));
  revalidatePath('/study');
  return request;
}

export async function openPeerReview(input: { threadId: string; rubric: string; externalUrl?: string; closesAt?: string }) {
  const actor = await requireActor();
  const rubric = [...new Set(input.rubric.split(',').map((item) => shortText(item, 80)).filter(Boolean))].slice(0, 6);
  if (!rubric.length) throw new Error('Provide at least one review criterion.');
  const closesAt = input.closesAt ? new Date(input.closesAt) : undefined;
  if (closesAt && Number.isNaN(closesAt.getTime())) throw new Error('Use a valid review closing time.');
  const review = await createPeerReview({ threadId: input.threadId, requesterId: actor.id, rubric, externalUrl: safeEditorialUrl(input.externalUrl), closesAt });
  revalidatePath('/study');
  return review;
}

export async function submitPeerFeedback(input: { reviewId: string; criterion: string; feedback: string }) {
  const actor = await requireActor();
  const feedback = input.feedback.trim();
  if (feedback.length < 20 || feedback.length > 1600) throw new Error('Use 20 to 1,600 characters for actionable feedback.');
  const result = await leavePeerReviewFeedback({ reviewId: input.reviewId, reviewerId: actor.id, criterion: shortText(input.criterion, 80), feedback });
  revalidatePath('/study');
  return result;
}

export async function requestMentorVerification(input: { subjects: string[]; statement: string }) {
  const actor = await requireActor();
  const subjects = clampProfileSubjects(input.subjects);
  const statement = input.statement.trim();
  if (!subjects.length || statement.length < 50 || statement.length > 1200) throw new Error('Choose supported subjects and provide a 50 to 1,200 character mentoring statement.');
  const profile = await requestMentorProfile({ userId: actor.id, subjects, statement });
  revalidatePath('/study');
  revalidatePath('/admin');
  return profile;
}

export async function requestMentorHelp(input: { mentorProfileId: string; subject: string; question: string }) {
  const actor = await requireActor();
  const question = input.question.trim();
  if (question.length < 20 || question.length > 1200) throw new Error('Use 20 to 1,200 characters for a focused mentor request.');
  const request = await requestMentorSupport({ mentorProfileId: input.mentorProfileId, requesterId: actor.id, subject: shortText(input.subject, 60), question });
  revalidatePath('/study');
  return request;
}

export async function proposeKnowledgeCard(input: { subject: string; title: string; summary: string; content: string; sourceThreadId?: string; sourceReplyId?: string }) {
  const actor = await requireActor();
  const title = shortText(input.title, 120);
  const summary = shortText(input.summary, 260);
  const content = input.content.trim();
  if (title.length < 8 || summary.length < 20 || content.length < 100) throw new Error('Provide a full knowledge-card title, summary, and explanation.');
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'knowledge'}-${crypto.randomUUID().slice(0, 8)}`;
  const card = await createKnowledgeCardDraft({ slug, subject: shortText(input.subject, 60), title, summary, content, createdBy: actor.id, sourceThreadId: input.sourceThreadId, sourceReplyId: input.sourceReplyId });
  revalidatePath('/knowledge');
  revalidatePath('/admin');
  return card;
}
