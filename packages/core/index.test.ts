import { describe, expect, it } from 'vitest';

import {
  REPORT_REASONS,
  SCHOOL_SUBJECTS,
  buildReplyNotification,
  clampProfileSubjects,
  isModerationRole,
  validateRegistration,
} from './index';

describe('forum subject taxonomy', () => {
  it('exposes the approved high-school subject categories in a stable order', () => {
    expect(SCHOOL_SUBJECTS).toEqual([
      'Math',
      'Science',
      'History',
      'English',
      'Art',
      'Computer Science',
      'General',
    ]);
  });

  it('keeps the moderation reason catalogue complete and non-duplicated', () => {
    expect(REPORT_REASONS).toHaveLength(6);
    expect(new Set(REPORT_REASONS)).toHaveLength(REPORT_REASONS.length);
    expect(REPORT_REASONS).toContain('Harassment or bullying');
    expect(REPORT_REASONS).toContain('Academic dishonesty');
  });
});

describe('isModerationRole', () => {
  it.each(['admin', 'moderator'])('recognizes %s as a moderation role', (role) => {
    expect(isModerationRole(role)).toBe(true);
  });

  it.each(['student', 'Admin', '', undefined, null])('rejects %s as a moderation role', (role) => {
    expect(isModerationRole(role)).toBe(false);
  });
});

describe('clampProfileSubjects', () => {
  it('trims, validates, de-duplicates, and preserves the first selected subjects', () => {
    expect(clampProfileSubjects([' Math ', 'Science', 'Math', 'Invalid', 'General'])).toEqual([
      'Math',
      'Science',
      'General',
    ]);
  });

  it('limits a profile to the first five valid unique subjects', () => {
    expect(
      clampProfileSubjects([
        'Math',
        'Science',
        'History',
        'English',
        'Art',
        'Computer Science',
        'General',
      ]),
    ).toEqual(['Math', 'Science', 'History', 'English', 'Art']);
  });

  it('returns an empty selection when every submitted value is invalid', () => {
    expect(clampProfileSubjects(['', 'physics', ' computer science '])).toEqual([]);
  });
});

describe('validateRegistration', () => {
  it('normalizes a valid account payload before persistence', () => {
    expect(validateRegistration({
      name: '  Avery Student  ',
      email: ' Avery@Example.COM ',
      password: 'secure-passphrase',
    })).toEqual({
      ok: true,
      data: {
        name: 'Avery Student',
        email: 'avery@example.com',
        password: 'secure-passphrase',
      },
    });
  });

  it.each(['', 'A', 'a'.repeat(61)])('rejects an invalid display-name length', (name) => {
    expect(validateRegistration({ name, email: 'avery@example.com', password: 'secure-passphrase' })).toEqual({
      ok: false,
      error: 'Enter a display name between 2 and 60 characters.',
    });
  });

  it.each(['', 'avery', 'avery@example', '@example.com'])('rejects an invalid email address', (email) => {
    expect(validateRegistration({ name: 'Avery', email, password: 'secure-passphrase' })).toEqual({
      ok: false,
      error: 'Enter a valid email address.',
    });
  });

  it('rejects a password shorter than eight characters', () => {
    expect(validateRegistration({ name: 'Avery', email: 'avery@example.com', password: 'short' })).toEqual({
      ok: false,
      error: 'Use a password with at least 8 characters.',
    });
  });
});

describe('buildReplyNotification', () => {
  it('describes a top-level reply as a discussion reply', () => {
    expect(buildReplyNotification('Avery', false)).toBe('Avery replied to your discussion.');
  });

  it('describes a nested reply as a comment reply', () => {
    expect(buildReplyNotification('Avery', true)).toBe('Avery replied to your comment.');
  });
});
