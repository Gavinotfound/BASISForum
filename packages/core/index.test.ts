import { describe, expect, it } from 'vitest';

import {
  REPORT_REASONS,
  SCHOOL_SUBJECTS,
  buildReplyNotification,
  clampProfileSubjects,
  isModerationRole,
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

describe('buildReplyNotification', () => {
  it('describes a top-level reply as a discussion reply', () => {
    expect(buildReplyNotification('Avery', false)).toBe('Avery replied to your discussion.');
  });

  it('describes a nested reply as a comment reply', () => {
    expect(buildReplyNotification('Avery', true)).toBe('Avery replied to your comment.');
  });
});
