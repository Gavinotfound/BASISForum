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
