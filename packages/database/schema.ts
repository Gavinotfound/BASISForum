import { pgTable, uuid, text, integer, timestamp, boolean, jsonb, primaryKey, uniqueIndex, index, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import type { AdapterAccountType } from "next-auth/adapters";

// --- NextAuth Tables ---

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  username: text('username').unique(),
  email: text('email').unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  password: text('password'), // For credentials provider
  image: text('image'),
  bio: text('bio'),
  school: text('school'),
  grade: text('grade'),
  favoriteSubjects: jsonb('favorite_subjects'),
  reputationScore: integer('reputation_score').default(0),
  role: text('role').default('student'), // student, moderator, teacher, admin
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (session) => ({
  sessionsUserExpiresIdx: index('sessions_user_expires_idx').on(session.userId, session.expires),
}));

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// --- Forum Tables ---

export const threads = pgTable('threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(), // Math, Science, etc.
  kind: text('kind').notNull().default('discussion'), // discussion, help_request, review_request
  helpContext: jsonb('help_context'),
  isSticky: boolean('is_sticky').default(false),
  isCommentsClosed: boolean('is_comments_closed').notNull().default(false),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (thread) => ({
  threadsCreatedIdx: index('threads_created_at_idx').on(thread.createdAt),
  threadsSubjectCreatedIdx: index('threads_subject_created_idx').on(thread.subject, thread.createdAt),
  threadsAuthorCreatedIdx: index('threads_author_created_idx').on(thread.authorId, thread.createdAt),
}));

export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').references(() => threads.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id').references((): AnyPgColumn => resources.id, { onDelete: 'cascade' }), // For nested comments
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  isThreadStarter: boolean('is_thread_starter').notNull().default(false),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (resource) => ({
  resourcesThreadCreatedIdx: index('resources_thread_created_idx').on(resource.threadId, resource.createdAt),
  resourcesParentCreatedIdx: index('resources_parent_created_idx').on(resource.parentId, resource.createdAt),
  resourcesAuthorCreatedIdx: index('resources_author_created_idx').on(resource.authorId, resource.createdAt),
  oneStarterPerThread: uniqueIndex('resources_one_starter_per_thread').on(resource.threadId).where(sql`${resource.isThreadStarter} = true`),
}));

export const bookmarks = pgTable(
  'bookmarks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    threadId: uuid('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (bookmark) => ({
    oneBookmarkPerThread: uniqueIndex('bookmarks_user_thread_unique').on(bookmark.userId, bookmark.threadId),
    bookmarksUserCreatedIdx: index('bookmarks_user_created_idx').on(bookmark.userId, bookmark.createdAt),
    bookmarksThreadIdx: index('bookmarks_thread_idx').on(bookmark.threadId),
  }),
);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  type: text('type').notNull(), // reply, mention, vote, report_update
  targetType: text('target_type').notNull(), // thread or comment
  targetId: uuid('target_id').notNull(),
  threadId: uuid('thread_id').references(() => threads.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (notification) => ({
  notificationsUserReadCreatedIdx: index('notifications_user_read_created_idx').on(notification.userId, notification.readAt, notification.createdAt),
  notificationsThreadIdx: index('notifications_thread_idx').on(notification.threadId),
}));

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: text('target_type').notNull(), // thread or comment
  targetId: uuid('target_id').notNull(),
  threadId: uuid('thread_id').references(() => threads.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull(),
  details: text('details'),
  status: text('status').notNull().default('pending'), // pending, reviewed, dismissed, actioned
  moderatorId: uuid('moderator_id').references(() => users.id, { onDelete: 'set null' }),
  resolutionNote: text('resolution_note'),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
},   (report) => ({
  reportsStatusCreatedIdx: index('reports_status_created_idx').on(report.status, report.createdAt),
  reportsThreadIdx: index('reports_thread_idx').on(report.threadId),
  reportsReporterCreatedIdx: index('reports_reporter_created_idx').on(report.reporterId, report.createdAt),
  onePendingReportPerTarget: uniqueIndex('reports_reporter_target_pending_unique').on(report.reporterId, report.targetType, report.targetId).where(sql`${report.status} = 'pending'`),
}));

export const votes = pgTable(
  'votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    targetType: text('target_type').notNull(), // 'thread' or 'comment'
    targetId: uuid('target_id').notNull(),
    value: integer('value').notNull(), // 1 for like, -1 for dislike
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (vote) => ({
    oneVotePerTarget: uniqueIndex('votes_user_target_unique').on(vote.userId, vote.targetType, vote.targetId),
    votesTargetIdx: index('votes_target_idx').on(vote.targetType, vote.targetId),
  }),
);

export const moderationLogs = pgTable('moderation_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  moderatorId: uuid('moderator_id').references(() => users.id),
  targetType: text('target_type').notNull(), // 'thread', 'post', 'user'
  targetId: uuid('target_id').notNull(),
  action: text('action').notNull(), // 'delete', 'ban', 'warn', 'sticky'
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

/** A singleton, Admin-managed configuration record for the forum’s top campaign slot. */
export const campaignSettings = pgTable('campaign_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  enabled: boolean('enabled').notNull().default(true),
  template: text('template').notNull().default('cinematic'),
  kind: text('kind').notNull().default('community'),
  eyebrow: text('eyebrow').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  actionLabel: text('action_label'),
  href: text('href'),
  accent: text('accent'),
  imageSrc: text('image_src'),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// --- Structured community safety and academic tables ---

export const userBlocks = pgTable('user_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  blockerId: uuid('blocker_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  blockedId: uuid('blocked_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (block) => ({
  uniquePair: uniqueIndex('user_blocks_unique_pair').on(block.blockerId, block.blockedId),
  blockerCreatedIdx: index('user_blocks_blocker_created_idx').on(block.blockerId, block.createdAt),
}));

export const reportAppeals = pgTable('report_appeals', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  appellantId: uuid('appellant_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  statement: text('statement').notNull(),
  status: text('status').notNull().default('pending'),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewNote: text('review_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
}, (appeal) => ({
  reportCreatedIdx: index('report_appeals_report_created_idx').on(appeal.reportId, appeal.createdAt),
  uniqueOpenAppeal: uniqueIndex('report_appeals_open_unique').on(appeal.reportId, appeal.appellantId).where(sql`${appeal.status} = 'pending'`),
}));

export const threadResolutions = pgTable('thread_resolutions', {
  threadId: uuid('thread_id').primaryKey().references(() => threads.id, { onDelete: 'cascade' }),
  replyId: uuid('reply_id').notNull().references(() => resources.id, { onDelete: 'cascade' }),
  resolvedBy: uuid('resolved_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const knowledgeCards = pgTable('knowledge_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  subject: text('subject').notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  sourceThreadId: uuid('source_thread_id').references(() => threads.id, { onDelete: 'set null' }),
  sourceReplyId: uuid('source_reply_id').references(() => resources.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('draft'),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (card) => ({
  subjectStatusPublishedIdx: index('knowledge_cards_subject_status_published_idx').on(card.subject, card.status, card.publishedAt),
  sourceThreadIdx: index('knowledge_cards_source_thread_idx').on(card.sourceThreadId),
}));

export const studyHubs = pgTable('study_hubs', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  status: text('status').notNull().default('draft'),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (hub) => ({
  subjectStatusEndsIdx: index('study_hubs_subject_status_ends_idx').on(hub.subject, hub.status, hub.endsAt),
}));

export const studyHubThreads = pgTable('study_hub_threads', {
  hubId: uuid('hub_id').notNull().references(() => studyHubs.id, { onDelete: 'cascade' }),
  threadId: uuid('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
  addedBy: uuid('added_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (membership) => ({
  compositeKey: primaryKey({ columns: [membership.hubId, membership.threadId] }),
}));

export const studyCircles = pgTable('study_circles', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  hostId: uuid('host_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  capacity: integer('capacity').notNull().default(4),
  locationLabel: text('location_label'),
  status: text('status').notNull().default('open'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (circle) => ({
  statusStartsIdx: index('study_circles_status_starts_idx').on(circle.status, circle.startsAt),
  hostCreatedIdx: index('study_circles_host_created_idx').on(circle.hostId, circle.createdAt),
}));

export const studyCircleRequests = pgTable('study_circle_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  circleId: uuid('circle_id').notNull().references(() => studyCircles.id, { onDelete: 'cascade' }),
  requesterId: uuid('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  note: text('note'),
  status: text('status').notNull().default('pending'),
  decidedBy: uuid('decided_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  decidedAt: timestamp('decided_at'),
}, (request) => ({
  uniqueRequesterCircle: uniqueIndex('study_circle_requests_unique_pair').on(request.circleId, request.requesterId),
  circleStatusIdx: index('study_circle_requests_circle_status_idx').on(request.circleId, request.status),
}));

// --- Peer review, mentorship, and verified creator publishing ---

export const peerReviews = pgTable('peer_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().unique().references(() => threads.id, { onDelete: 'cascade' }),
  requesterId: uuid('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rubric: jsonb('rubric').notNull(),
  externalUrl: text('external_url'),
  status: text('status').notNull().default('open'),
  closesAt: timestamp('closes_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const peerReviewFeedback = pgTable('peer_review_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id').notNull().references(() => peerReviews.id, { onDelete: 'cascade' }),
  reviewerId: uuid('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  criterion: text('criterion').notNull(),
  feedback: text('feedback').notNull(),
  isHelpful: boolean('is_helpful'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (feedback) => ({
  reviewCreatedIdx: index('peer_review_feedback_review_created_idx').on(feedback.reviewId, feedback.createdAt),
  uniqueReviewerCriterion: uniqueIndex('peer_review_feedback_unique_criterion').on(feedback.reviewId, feedback.reviewerId, feedback.criterion),
}));

export const mentorProfiles = pgTable('mentor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  subjects: jsonb('subjects').notNull(),
  statement: text('statement').notNull(),
  status: text('status').notNull().default('requested'),
  verifiedBy: uuid('verified_by').references(() => users.id, { onDelete: 'set null' }),
  verifiedAt: timestamp('verified_at'),
  expiresAt: timestamp('expires_at'),
  reviewNote: text('review_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (mentor) => ({
  statusIdx: index('mentor_profiles_status_idx').on(mentor.status),
}));

export const mentorRequests = pgTable('mentor_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  mentorProfileId: uuid('mentor_profile_id').notNull().references(() => mentorProfiles.id, { onDelete: 'cascade' }),
  requesterId: uuid('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  question: text('question').notNull(),
  status: text('status').notNull().default('pending'),
  responseNote: text('response_note'),
  decidedAt: timestamp('decided_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (request) => ({
  mentorStatusCreatedIdx: index('mentor_requests_mentor_status_created_idx').on(request.mentorProfileId, request.status, request.createdAt),
}));

export const creatorProfiles = pgTable('creator_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  status: text('status').notNull().default('requested'),
  displayName: text('display_name').notNull(),
  statement: text('statement').notNull(),
  verifiedBy: uuid('verified_by').references(() => users.id, { onDelete: 'set null' }),
  verifiedAt: timestamp('verified_at'),
  expiresAt: timestamp('expires_at'),
  suspensionNote: text('suspension_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (creator) => ({
  statusIdx: index('creator_profiles_status_idx').on(creator.status),
}));

export const editorialPosts = pgTable('editorial_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  headline: text('headline').notNull(),
  dek: text('dek').notNull(),
  body: text('body').notNull(),
  kind: text('kind').notNull(),
  status: text('status').notNull().default('draft'),
  authorId: uuid('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  creatorProfileId: uuid('creator_profile_id').references(() => creatorProfiles.id, { onDelete: 'set null' }),
  tags: jsonb('tags').notNull().default(sql`'[]'::jsonb`),
  sourceLinks: jsonb('source_links').notNull().default(sql`'[]'::jsonb`),
  imageSrc: text('image_src'),
  discussionThreadId: uuid('discussion_thread_id').references(() => threads.id, { onDelete: 'set null' }),
  reviewNote: text('review_note'),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  publisherId: uuid('publisher_id').references(() => users.id, { onDelete: 'set null' }),
  publishedAt: timestamp('published_at'),
  scheduledAt: timestamp('scheduled_at'),
  archivedAt: timestamp('archived_at'),
  correctionNote: text('correction_note'),
  isSponsored: boolean('is_sponsored').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (post) => ({
  statusPublishedIdx: index('editorial_posts_status_published_idx').on(post.status, post.publishedAt),
  kindStatusPublishedIdx: index('editorial_posts_kind_status_published_idx').on(post.kind, post.status, post.publishedAt),
  authorCreatedIdx: index('editorial_posts_author_created_idx').on(post.authorId, post.createdAt),
}));

export const editorialPostRevisions = pgTable('editorial_post_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => editorialPosts.id, { onDelete: 'cascade' }),
  revisionNumber: integer('revision_number').notNull(),
  snapshot: jsonb('snapshot').notNull(),
  state: text('state').notNull(),
  reviewNote: text('review_note'),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (revision) => ({
  uniqueRevision: uniqueIndex('editorial_post_revisions_unique_number').on(revision.postId, revision.revisionNumber),
  postCreatedIdx: index('editorial_post_revisions_post_created_idx').on(revision.postId, revision.createdAt),
}));

export const editorialEvents = pgTable('editorial_events', {
  postId: uuid('post_id').primaryKey().references(() => editorialPosts.id, { onDelete: 'cascade' }),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  timezone: text('timezone').notNull().default('Asia/Shanghai'),
  locationLabel: text('location_label'),
  registrationUrl: text('registration_url'),
  capacityNote: text('capacity_note'),
  organizerLabel: text('organizer_label'),
  status: text('status').notNull().default('scheduled'),
});

export const editorialHomepageFeatures = pgTable('editorial_homepage_features', {
  slot: text('slot').primaryKey(),
  postId: uuid('post_id').notNull().references(() => editorialPosts.id, { onDelete: 'cascade' }),
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),
  featuredBy: uuid('featured_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  selectionNote: text('selection_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
  threads: many(threads),
  resources: many(resources),
  votes: many(votes),
  bookmarks: many(bookmarks),
  notifications: many(notifications, { relationName: 'notificationRecipient' }),
  sentNotifications: many(notifications, { relationName: 'notificationActor' }),
  reports: many(reports, { relationName: 'reporter' }),
  moderatedReports: many(reports, { relationName: 'reportModerator' }),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  author: one(users, { fields: [threads.authorId], references: [users.id] }),
  resources: many(resources),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  thread: one(threads, { fields: [resources.threadId], references: [threads.id] }),
  author: one(users, { fields: [resources.authorId], references: [users.id] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  thread: one(threads, { fields: [bookmarks.threadId], references: [threads.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, { fields: [notifications.userId], references: [users.id], relationName: 'notificationRecipient' }),
  actor: one(users, { fields: [notifications.actorId], references: [users.id], relationName: 'notificationActor' }),
  thread: one(threads, { fields: [notifications.threadId], references: [threads.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, { fields: [reports.reporterId], references: [users.id], relationName: 'reporter' }),
  moderator: one(users, { fields: [reports.moderatorId], references: [users.id], relationName: 'reportModerator' }),
  thread: one(threads, { fields: [reports.threadId], references: [threads.id] }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, { fields: [votes.userId], references: [users.id] }),
}));

