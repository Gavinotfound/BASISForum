'use server';

import {
  createCreatorProfileRequest,
  createEditorialDraft,
  createEditorialRevision,
  getVerifiedCreatorProfile,
  submitEditorialForReview,
  updateEditorialDraft,
  upsertEditorialEvent,
} from '@basis-forum/database';
import { isCreatorType, isEditorialKind, safeCampusLocation, safeEditorialUrl, shortText } from '@basis-forum/core';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

type SessionActor = { id?: string; role?: string };

type CreatorDraftInput = {
  postId?: string;
  headline: string;
  dek: string;
  body: string;
  kind: string;
  tags?: string;
  sources?: string;
  imageSrc?: string;
  scheduledAt?: string;
  eventStartsAt?: string;
  eventEndsAt?: string;
  eventLocation?: string;
  eventRegistrationUrl?: string;
  eventOrganizer?: string;
};

const requireActor = async (): Promise<SessionActor & { id: string }> => {
  const session = await auth();
  const actor = session?.user as SessionActor | undefined;
  if (!actor?.id) throw new Error('Sign in to continue.');
  return actor as SessionActor & { id: string };
};

const parseDraft = (input: CreatorDraftInput) => {
  const headline = shortText(input.headline, 120);
  const dek = shortText(input.dek, 260);
  const body = input.body.trim();
  if (headline.length < 8 || dek.length < 20 || body.length < 80) throw new Error('Add a fuller headline, summary, and story before saving.');
  if (!isEditorialKind(input.kind)) throw new Error('Choose a supported Bulletin type.');
  const tags = [...new Set((input.tags || '').split(',').map((tag) => shortText(tag, 30)).filter(Boolean))].slice(0, 6);
  const sourceLinks = (input.sources || '').split(/\n|,/).map((source) => safeEditorialUrl(source)).filter((source): source is string => Boolean(source)).slice(0, 6);
  const imageSrc = safeEditorialUrl(input.imageSrc) || (input.imageSrc?.startsWith('/') ? input.imageSrc : undefined);
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : undefined;
  if (scheduledAt && Number.isNaN(scheduledAt.getTime())) throw new Error('Use a valid publication time.');
  return { headline, dek, body, kind: input.kind, tags, sourceLinks, imageSrc, scheduledAt };
};

export async function requestCreatorAccess(input: { type: string; displayName: string; statement: string }) {
  const actor = await requireActor();
  if (!isCreatorType(input.type)) throw new Error('Choose a supported creator type.');
  const displayName = shortText(input.displayName, 80);
  const statement = input.statement.trim();
  if (displayName.length < 2 || statement.length < 30) throw new Error('Provide a creator name and a statement of at least 30 characters.');
  const profile = await createCreatorProfileRequest({ userId: actor.id, type: input.type, displayName, statement });
  revalidatePath('/creator');
  return profile;
}

export async function saveCreatorDraft(input: CreatorDraftInput) {
  const actor = await requireActor();
  const profile = await getVerifiedCreatorProfile(actor.id);
  if (!profile && actor.role !== 'admin' && actor.role !== 'moderator') throw new Error('Verified creator access is required to write for Bulletin.');
  const draft = parseDraft(input);
  const post = input.postId
    ? await updateEditorialDraft(input.postId, actor.id, draft)
    : await createEditorialDraft({ ...draft, authorId: actor.id, creatorProfileId: profile?.id });
  if (!post) throw new Error('This draft is no longer editable.');
  await createEditorialRevision({ postId: post.id, createdBy: actor.id, snapshot: draft, state: post.status });
  if (draft.kind === 'event' && input.eventStartsAt && input.eventEndsAt) {
    const startsAt = new Date(input.eventStartsAt);
    const endsAt = new Date(input.eventEndsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) throw new Error('Event end time must be after its start time.');
    await upsertEditorialEvent({
      postId: post.id,
      startsAt,
      endsAt,
      locationLabel: input.eventLocation ? safeCampusLocation(input.eventLocation) : undefined,
      registrationUrl: safeEditorialUrl(input.eventRegistrationUrl),
      organizerLabel: input.eventOrganizer ? shortText(input.eventOrganizer, 100) : undefined,
    });
  }
  revalidatePath('/creator');
  return post;
}

export async function submitCreatorDraft(postId: string) {
  const actor = await requireActor();
  const post = await submitEditorialForReview(postId, actor.id);
  if (!post) throw new Error('Only one of your current drafts can be submitted.');
  revalidatePath('/creator');
  return post;
}
