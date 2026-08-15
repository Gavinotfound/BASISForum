export const SCHOOL_SUBJECTS = [
  'Math',
  'Science',
  'History',
  'English',
  'Art',
  'Computer Science',
  'General',
] as const;

export const REPORT_REASONS = [
  'Spam or advertising',
  'Harassment or bullying',
  'Academic dishonesty',
  'Harmful or unsafe content',
  'Incorrect subject category',
  'Other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const isModerationRole = (role?: string | null) => role === 'admin' || role === 'moderator';

export const clampProfileSubjects = (subjects: string[]) =>
  [...new Set(subjects.map((subject) => subject.trim()).filter((subject) => SCHOOL_SUBJECTS.includes(subject as (typeof SCHOOL_SUBJECTS)[number])))]
    .slice(0, 5);

export const buildReplyNotification = (actorName: string, isNestedReply: boolean) =>
  `${actorName} ${isNestedReply ? 'replied to your comment' : 'replied to your discussion'}.`;

export type RegistrationInput = {
  name: string;
  email: string;
  password: string;
};

export type ValidRegistrationInput = {
  name: string;
  email: string;
  password: string;
};

export type RegistrationValidationResult =
  | { ok: true; data: ValidRegistrationInput }
  | { ok: false; error: string };

export const validateRegistration = (input: RegistrationInput): RegistrationValidationResult => {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (name.length < 2 || name.length > 60) {
    return { ok: false, error: 'Enter a display name between 2 and 60 characters.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }

  if (input.password.length < 8) {
    return { ok: false, error: 'Use a password with at least 8 characters.' };
  }

  return { ok: true, data: { name, email, password: input.password } };
};


// --- Structured community and editorial domain contracts ---

export const THREAD_KINDS = ['discussion', 'help_request', 'review_request'] as const;
export type ThreadKind = (typeof THREAD_KINDS)[number];

export const EDITORIAL_STATES = ['draft', 'in_review', 'published', 'archived'] as const;
export type EditorialState = (typeof EDITORIAL_STATES)[number];

export const EDITORIAL_KINDS = ['news', 'announcement', 'event', 'editorial_update'] as const;
export type EditorialKind = (typeof EDITORIAL_KINDS)[number];

export const CREATOR_TYPES = ['student_publication', 'club', 'faculty_staff', 'school_office'] as const;
export type CreatorType = (typeof CREATOR_TYPES)[number];

export const CREATOR_STATUSES = ['requested', 'verified', 'suspended', 'expired'] as const;
export type CreatorStatus = (typeof CREATOR_STATUSES)[number];

export const STUDY_CIRCLE_STATUSES = ['open', 'full', 'cancelled', 'completed'] as const;
export type StudyCircleStatus = (typeof STUDY_CIRCLE_STATUSES)[number];

export const REQUEST_STATUSES = ['pending', 'accepted', 'declined', 'cancelled'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const MENTOR_STATUSES = ['requested', 'verified', 'suspended', 'expired'] as const;
export type MentorStatus = (typeof MENTOR_STATUSES)[number];

export const isThreadKind = (value: string): value is ThreadKind => THREAD_KINDS.includes(value as ThreadKind);
export const isEditorialState = (value: string): value is EditorialState => EDITORIAL_STATES.includes(value as EditorialState);
export const isEditorialKind = (value: string): value is EditorialKind => EDITORIAL_KINDS.includes(value as EditorialKind);
export const isCreatorType = (value: string): value is CreatorType => CREATOR_TYPES.includes(value as CreatorType);
export const isCreatorStatus = (value: string): value is CreatorStatus => CREATOR_STATUSES.includes(value as CreatorStatus);
export const isStudyCircleStatus = (value: string): value is StudyCircleStatus => STUDY_CIRCLE_STATUSES.includes(value as StudyCircleStatus);
export const isRequestStatus = (value: string): value is RequestStatus => REQUEST_STATUSES.includes(value as RequestStatus);
export const isMentorStatus = (value: string): value is MentorStatus => MENTOR_STATUSES.includes(value as MentorStatus);

export const safeEditorialUrl = (value?: string | null) => {
  const candidate = value?.trim();
  if (!candidate) return undefined;
  if (candidate.startsWith('/')) return candidate;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'https:' ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
};

export const shortText = (value: string, maxLength: number) => value.trim().replace(/\s+/g, ' ').slice(0, maxLength);

export const safeCampusLocation = (value: string) => {
  const normalized = shortText(value, 100);
  if (!normalized) return undefined;
  if (/\b\d{1,5}\s+[A-Za-z0-9.'-]+\s+(street|st|road|rd|avenue|ave|lane|ln|drive|dr|court|ct|boulevard|blvd)\b/i.test(normalized)) {
    return undefined;
  }
  return normalized;
};

export const buildEditorialSlug = (headline: string, suffix: string) =>
  `${shortText(headline.toLowerCase(), 72).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'bulletin'}-${suffix.slice(0, 8)}`;
