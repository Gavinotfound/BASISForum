import { describe, expect, it } from 'vitest';

import {
  REPORT_REASONS,
  SCHOOL_SUBJECTS,
  buildEditorialSlug,
  isCreatorStatus,
  isCreatorType,
  isEditorialKind,
  isEditorialState,
  isMentorStatus,
  isRequestStatus,
  isStudyCircleStatus,
  isThreadKind,
  safeCampusLocation,
  safeEditorialUrl,
  shortText,
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

describe('expansion domain validators', () => {
  it.each(['discussion', 'help_request', 'review_request'])('recognizes %s as a thread kind', (kind) => {
    expect(isThreadKind(kind)).toBe(true);
  });

  it.each(['question', 'announcement ', '', 'REVIEW_REQUEST'])('rejects %s as an invalid thread kind', (kind) => {
    expect(isThreadKind(kind)).toBe(false);
  });

  it.each(['news', 'announcement', 'event', 'editorial_update'])('recognizes %s as an editorial kind', (kind) => {
    expect(isEditorialKind(kind)).toBe(true);
  });

  it.each(['article', 'NEWS', ''])('rejects %s as an invalid editorial kind', (kind) => {
    expect(isEditorialKind(kind)).toBe(false);
  });

  it.each(['student_publication', 'club', 'faculty_staff', 'school_office'])('recognizes %s as a creator type', (kind) => {
    expect(isCreatorType(kind)).toBe(true);
  });

  it.each(['student', 'Club', ''])('rejects %s as an invalid creator type', (kind) => {
    expect(isCreatorType(kind)).toBe(false);
  });

  it.each([
    [isEditorialState, 'published', 'unlisted'],
    [isCreatorStatus, 'verified', 'approved'],
    [isStudyCircleStatus, 'open', 'active'],
    [isRequestStatus, 'accepted', 'waiting'],
    [isMentorStatus, 'suspended', 'approved'],
  ])('validates expansion status guard values', (guard, valid, invalid) => {
    expect(guard(valid)).toBe(true);
    expect(guard(invalid)).toBe(false);
  });

  it('allows safe internal and HTTPS editorial links but rejects other schemes', () => {
    expect(safeEditorialUrl()).toBeUndefined();
    expect(safeEditorialUrl('/bulletin/fall-festival')).toBe('/bulletin/fall-festival');
    expect(safeEditorialUrl(' https://basis.example/story ')).toBe('https://basis.example/story');
    expect(safeEditorialUrl('http://basis.example/story')).toBeUndefined();
    expect(safeEditorialUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeEditorialUrl('not a valid URL')).toBeUndefined();
  });

  it('normalizes and bounds short user-authored labels', () => {
    expect(shortText('  A   concise\n  label  ', 20)).toBe('A concise label');
    expect(shortText('0123456789', 6)).toBe('012345');
  });

  it('keeps campus-safe labels but rejects street-address patterns', () => {
    expect(safeCampusLocation('Library collaboration room')).toBe('Library collaboration room');
    expect(safeCampusLocation('  Science   Lab 2  ')).toBe('Science Lab 2');
    expect(safeCampusLocation('120 Main Street')).toBeUndefined();
    expect(safeCampusLocation('   ')).toBeUndefined();
  });

  it('builds stable, URL-safe editorial slugs from a headline and opaque suffix', () => {
    expect(buildEditorialSlug('  Fall Festival: What to Know! ', 'abc12345-longer')).toBe('fall-festival-what-to-know-abc12345');
    expect(buildEditorialSlug('***', 'xyz98765')).toBe('bulletin-xyz98765');
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
