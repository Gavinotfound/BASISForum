'use server';

import {
  createCreatorProfileRequest,
  createEditorialDraft,
  createEditorialRevision,
  createModerationLog,
  getVerifiedCreatorProfile,
  reviewEditorialPost,
  setCreatorProfileStatus,
  setEditorialHomepageFeature,
  submitEditorialForReview,
  updateEditorialDraft,
  upsertEditorialEvent,
} from '@basis-forum/database';
import {
  safeCampusLocation,
  safeEditorialUrl,
  isCreatorType,
  isEditorialKind,
  isModerationRole,
  shortText,
} from '@basis-forum/core';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

type EditorialActor = { id?: string; role?: string; name?: string };

type DraftInput = {
  postId?: string;
  headline: string;
  dek: string;
  body: string;
  kind: string;
  tags?: string[];
  sourceLinks?: string[];
  imageSrc?: string;
  scheduledAt?: string;
  isSponsored?: boolean;
};

const requireUser = async (): Promise<EditorialActor & { id: string }> => {
  const session = await auth();
  const actor = session?.user as EditorialActor | undefined;
  if (!actor?.id) throw new Error('Sign in to continue.');
  return actor as EditorialActor & { id: string };
};

const requireModerator = async () => {
  const actor = await requireUser();
  if (!isModerationRole(actor.role)) throw new Error('Editorial review requires moderator access.');
  return actor;
};

const requireAdministrator = async () => {
  const actor = await requireUser();
  if (actor.role !== 'admin') throw new Error('This publishing control requires administrator access.');
  return actor;
};

const parseDraft = (input: DraftInput) => {
  const headline = shortText(input.headline, 120);
  const dek = shortText(input.dek, 260);
  const body = input.body.trim();
  if (headline.length < 8) throw new Error('Use a headline with at least 8 characters.');
  if (dek.length < 20) throw new Error('Use a summary with at least 20 characters.');
  if (body.length < 80) throw new Error('Use at least 80 characters for an editorial post.');
  if (!isEditorialKind(input.kind)) throw new Error('Choose a supported post type.');
  const sourceLinks = (input.sourceLinks || []).map((link) => safeEditorialUrl(link)).filter((link): link is string => Boolean(link)).slice(0, 6);
  const imageSrc = safeEditorialUrl(input.imageSrc) || (input.imageSrc?.startsWith('/') ? input.imageSrc : undefined);
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : undefined;
  if (scheduledAt && Number.isNaN(scheduledAt.getTime())) throw new Error('Use a valid publication time.');
  return {
    headline,
    dek,
    body,
    kind: input.kind,
    tags: [...new Set((input.tags || []).map((tag) => shortText(tag, 30)).filter(Boolean))].slice(0, 6),
    sourceLinks,
    imageSrc,
    scheduledAt,
    isSponsored: Boolean(input.isSponsored),
  };
};

export async function requestCreatorVerification(input: { type: string; displayName: string; statement: string }) {
  const actor = await requireUser();
  if (!isCreatorType(input.type)) throw new Error('Choose a supported creator type.');
  const displayName = shortText(input.displayName, 80);
  const statement = input.statement.trim();
  if (displayName.length < 2 || statement.length < 30) throw new Error('Provide a creator name and a statement of at least 30 characters.');
  const profile = await createCreatorProfileRequest({ userId: actor.id, type: input.type, displayName, statement });
  revalidatePath('/creator');
  revalidatePath('/admin');
  return profile;
}

export async function saveEditorialDraft(input: DraftInput) {
  const actor = await requireUser();
  const creator = await getVerifiedCreatorProfile(actor.id);
  if (!creator && !isModerationRole(actor.role)) throw new Error('Verified creator status is required to write for BASIS Bulletin.');
  const draft = parseDraft(input);
  const post = input.postId
    ? await updateEditorialDraft(input.postId, actor.id, draft)
    : await createEditorialDraft({ ...draft, authorId: actor.id, creatorProfileId: creator?.id });
  if (!post) throw new Error('This draft is not available for editing.');
  await createEditorialRevision({ postId: post.id, createdBy: actor.id, snapshot: draft, state: post.status });
  revalidatePath('/creator');
  return post;
}

export async function submitBulletinPost(postId: string) {
  const actor = await requireUser();
  const post = await submitEditorialForReview(postId, actor.id);
  if (!post) throw new Error('Only your current draft can be submitted for review.');
  revalidatePath('/creator');
  revalidatePath('/admin');
  return post;
}

export async function reviewBulletinPost(input: { postId: string; decision: 'request_changes' | 'publish' | 'archive'; reviewNote?: string; publishAt?: string }) {
  const actor = await requireModerator();
  if (input.decision === 'publish' && actor.role !== 'admin') throw new Error('Only administrators can publish Bulletin content.');
  const publishAt = input.publishAt ? new Date(input.publishAt) : undefined;
  if (publishAt && Number.isNaN(publishAt.getTime())) throw new Error('Use a valid publication time.');
  const post = await reviewEditorialPost({ postId: input.postId, reviewerId: actor.id, decision: input.decision, reviewNote: input.reviewNote, publishAt });
  if (!post) throw new Error('Bulletin post not found.');
  await createEditorialRevision({ postId: post.id, createdBy: actor.id, snapshot: { status: post.status, headline: post.headline }, state: post.status, reviewNote: input.reviewNote });
  await createModerationLog({ moderatorId: actor.id, targetType: 'editorial', targetId: post.id, action: `editorial_${input.decision}`, reason: input.reviewNote });
  revalidatePath('/admin');
  revalidatePath('/bulletin');
  revalidatePath(`/bulletin/${post.slug}`);
  revalidatePath('/');
  return post;
}

export async function verifyCreatorProfile(input: { profileId: string; status: 'verified' | 'suspended'; note?: string; expiresAt?: string }) {
  const actor = await requireAdministrator();
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : undefined;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) throw new Error('Use a valid verification expiry date.');
  const profile = await setCreatorProfileStatus({ profileId: input.profileId, status: input.status, verifiedBy: actor.id, note: input.note, expiresAt });
  if (!profile) throw new Error('Creator profile not found.');
  await createModerationLog({ moderatorId: actor.id, targetType: 'creator', targetId: profile.id, action: `creator_${input.status}`, reason: input.note });
  revalidatePath('/admin');
  revalidatePath('/creator');
  return profile;
}

export async function saveBulletinEvent(input: { postId: string; startsAt: string; endsAt: string; locationLabel?: string; registrationUrl?: string; capacityNote?: string; organizerLabel?: string }) {
  const actor = await requireModerator();
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) throw new Error('Use a valid event window.');
  const event = await upsertEditorialEvent({
    postId: input.postId,
    startsAt,
    endsAt,
    locationLabel: input.locationLabel ? safeCampusLocation(input.locationLabel) : undefined,
    registrationUrl: safeEditorialUrl(input.registrationUrl),
    capacityNote: input.capacityNote ? shortText(input.capacityNote, 100) : undefined,
    organizerLabel: input.organizerLabel ? shortText(input.organizerLabel, 100) : undefined,
  });
  await createModerationLog({ moderatorId: actor.id, targetType: 'editorial', targetId: input.postId, action: 'editorial_event_saved' });
  revalidatePath('/admin');
  revalidatePath('/bulletin');
  return event;
}

export async function featureBulletinPost(input: { postId: string; startsAt?: string; endsAt?: string; selectionNote?: string }) {
  const actor = await requireAdministrator();
  const startsAt = input.startsAt ? new Date(input.startsAt) : undefined;
  const endsAt = input.endsAt ? new Date(input.endsAt) : undefined;
  if ((startsAt && Number.isNaN(startsAt.getTime())) || (endsAt && Number.isNaN(endsAt.getTime())) || (startsAt && endsAt && endsAt <= startsAt)) {
    throw new Error('Use a valid homepage feature window.');
  }
  const feature = await setEditorialHomepageFeature({ postId: input.postId, featuredBy: actor.id, startsAt, endsAt, selectionNote: input.selectionNote });
  await createModerationLog({ moderatorId: actor.id, targetType: 'editorial', targetId: input.postId, action: 'editorial_featured', reason: input.selectionNote });
  revalidatePath('/');
  revalidatePath('/admin');
  return feature;
}
