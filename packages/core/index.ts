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
