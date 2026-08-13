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
  isSticky: boolean('is_sticky').default(false),
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
}, (report) => ({
  reportsStatusCreatedIdx: index('reports_status_created_idx').on(report.status, report.createdAt),
  reportsThreadIdx: index('reports_thread_idx').on(report.threadId),
  reportsReporterCreatedIdx: index('reports_reporter_created_idx').on(report.reporterId, report.createdAt),
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

