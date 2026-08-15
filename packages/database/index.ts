import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { Thread, User, Resource } from './types';
import { and, asc, count, desc, eq, gt, gte, ilike, inArray, isNull, lte, or, type SQL } from 'drizzle-orm';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://basis_user:basis_password@localhost:5432/basis_forum',
});

export const db = drizzle(pool, { schema });

export type ForumComment = Resource & {
  author_name: string;
  author_username?: string;
};

// --- Query Functions ---

export type ThreadSort = 'latest' | 'hot';

export type ForumThread = Thread & {
  author_name: string;
  author_username?: string;
  like_count: number;
  dislike_count: number;
  vote_score: number;
  reply_count: number;
};

export type ThreadQueryOptions = {
  sort?: ThreadSort;
  authorId?: string;
  subject?: string;
  threadIds?: string[];
};

export const getThreads = async (input: ThreadSort | ThreadQueryOptions = 'latest'): Promise<ForumThread[]> => {
  const options = typeof input === 'string' ? { sort: input } : input;
  const sort = options.sort || 'latest';
  const filters: SQL[] = [];

  if (options.authorId) filters.push(eq(schema.threads.authorId, options.authorId));
  if (options.subject) filters.push(eq(schema.threads.subject, options.subject));
  if (options.threadIds) {
    if (options.threadIds.length === 0) return [];
    filters.push(inArray(schema.threads.id, options.threadIds));
  }

  try {
    const result = await db.query.threads.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      orderBy: [desc(schema.threads.createdAt)],
      with: { author: true },
    });
    const threadIds = result.map((thread) => thread.id);

    const [voteSummaries, resourceRows] = await Promise.all([
      getVoteSummaries(threadIds.map((targetId) => ({ targetType: 'thread' as const, targetId })), undefined),
      threadIds.length > 0
        ? db.select({ threadId: schema.resources.threadId, isThreadStarter: schema.resources.isThreadStarter }).from(schema.resources).where(inArray(schema.resources.threadId, threadIds))
        : Promise.resolve([]),
    ]);

    const replyCounts = new Map<string, number>();
    for (const resource of resourceRows) {
      if (resource.threadId && !resource.isThreadStarter) {
        replyCounts.set(resource.threadId, (replyCounts.get(resource.threadId) || 0) + 1);
      }
    }

    const threads = result.map((thread) => {
      const vote = voteSummaries.get(`thread:${thread.id}`) || { likes: 0, dislikes: 0, score: 0 };
      return {
        id: thread.id,
        title: thread.title,
        slug: thread.slug,
        author_id: thread.authorId || '',
        author_name: thread.author?.name || thread.author?.username || 'Student',
        author_username: thread.author?.username || undefined,
        subject: thread.subject,
        is_sticky: thread.isSticky ?? false,
        view_count: thread.viewCount ?? 0,
        created_at: thread.createdAt?.toISOString() || '',
        updated_at: thread.updatedAt?.toISOString() || '',
        like_count: vote.likes,
        dislike_count: vote.dislikes,
        vote_score: vote.score,
        reply_count: replyCounts.get(thread.id) || 0,
      };
    });

    return sort === 'hot'
      ? threads.sort((a, b) => b.vote_score - a.vote_score || b.reply_count - a.reply_count || b.created_at.localeCompare(a.created_at))
      : threads;
  } catch (error) {
    console.error('Database fetch failed:', error);
    return [];
  }
};

export const getThreadBySlug = async (slug: string) => {
  try {
    return await db.query.threads.findFirst({
      where: eq(schema.threads.slug, slug),
      with: { author: true },
    });
  } catch (error) {
    console.error('Thread lookup failed:', error);
    return null;
  }
};

export const getThreadById = async (threadId: string) => {
  try {
    return await db.query.threads.findFirst({
      where: eq(schema.threads.id, threadId),
      with: { author: true },
    });
  } catch (error) {
    console.error('Thread lookup failed:', error);
    return null;
  }
};

export const getCommentsByThreadId = async (threadId: string, viewerId?: string): Promise<ForumComment[]> => {
  try {
    const comments = await db.query.resources.findMany({
      where: eq(schema.resources.threadId, threadId),
      orderBy: [asc(schema.resources.createdAt)],
      with: { author: true },
    });

    const blockedUserIds = viewerId ? await getBlockedUserIds(viewerId) : new Set<string>();
    return comments.filter((comment) => !blockedUserIds.has(comment.authorId || '')).map((comment) => ({
      id: comment.id,
      thread_id: comment.threadId || '',
      parent_id: comment.parentId || undefined,
      author_id: comment.authorId || '',
      content: comment.content,
      is_thread_starter: comment.isThreadStarter,
      metadata: comment.metadata,
      created_at: comment.createdAt?.toISOString() || '',
      updated_at: comment.updatedAt?.toISOString() || '',
      author_name: comment.author?.name || comment.author?.username || 'Student',
      author_username: comment.author?.username || undefined,
    }));
  } catch (error) {
    console.error('Comment lookup failed:', error);
    return [];
  }
};

export const getCommentById = async (threadId: string, commentId: string) => {
  try {
    return await db.query.resources.findFirst({
      where: and(eq(schema.resources.id, commentId), eq(schema.resources.threadId, threadId)),
      with: { author: true },
    });
  } catch (error) {
    console.error('Comment lookup failed:', error);
    return null;
  }
};

export type VoteTargetType = 'thread' | 'comment';

export type VoteSummary = {
  likes: number;
  dislikes: number;
  score: number;
  currentUserVote: 1 | -1 | 0;
};

export const getVoteSummaries = async (
  targets: Array<{ targetType: VoteTargetType; targetId: string }>,
  currentUserId?: string,
): Promise<Map<string, VoteSummary>> => {
  const summaries = new Map<string, VoteSummary>();
  const targetIdsByType = new Map<VoteTargetType, string[]>();

  for (const target of targets) {
    summaries.set(`${target.targetType}:${target.targetId}`, { likes: 0, dislikes: 0, score: 0, currentUserVote: 0 });
    const ids = targetIdsByType.get(target.targetType) || [];
    if (target.targetId && !ids.includes(target.targetId)) ids.push(target.targetId);
    targetIdsByType.set(target.targetType, ids);
  }

  if (targetIdsByType.size === 0) return summaries;

  try {
    const conditions = [...targetIdsByType.entries()]
      .filter(([, ids]) => ids.length > 0)
      .map(([targetType, ids]) => and(eq(schema.votes.targetType, targetType), inArray(schema.votes.targetId, ids)));
    const voteRows = await db.select().from(schema.votes).where(or(...conditions));

    for (const vote of voteRows) {
      const key = `${vote.targetType}:${vote.targetId}`;
      const summary = summaries.get(key);
      if (!summary) continue;

      if (vote.value === 1) summary.likes += 1;
      if (vote.value === -1) summary.dislikes += 1;
      if (currentUserId && vote.userId === currentUserId) {
        summary.currentUserVote = vote.value === 1 ? 1 : -1;
      }
      summary.score = summary.likes - summary.dislikes;
    }
  } catch (error) {
    console.error('Vote summary lookup failed:', error);
  }

  return summaries;
};

export const toggleVote = async (data: {
  userId: string;
  targetType: VoteTargetType;
  targetId: string;
  value: 1 | -1;
}) => {
  const [existingVote] = await db
    .select()
    .from(schema.votes)
    .where(
      and(
        eq(schema.votes.userId, data.userId),
        eq(schema.votes.targetType, data.targetType),
        eq(schema.votes.targetId, data.targetId),
      ),
    );

  if (existingVote?.value === data.value) {
    await db.delete(schema.votes).where(eq(schema.votes.id, existingVote.id));
  } else if (existingVote) {
    await db
      .update(schema.votes)
      .set({ value: data.value, updatedAt: new Date() })
      .where(eq(schema.votes.id, existingVote.id));
  } else {
    await db.insert(schema.votes).values({
      userId: data.userId,
      targetType: data.targetType,
      targetId: data.targetId,
      value: data.value,
    });
  }

  const summaries = await getVoteSummaries(
    [{ targetType: data.targetType, targetId: data.targetId }],
    data.userId,
  );

  return summaries.get(`${data.targetType}:${data.targetId}`) || { likes: 0, dislikes: 0, score: 0, currentUserVote: 0 };
};

export type ProfileUpdate = {
  name?: string;
  username?: string;
  bio?: string;
  school?: string;
  grade?: string;
  favoriteSubjects?: string[];
};

export const getUserProfile = async (userId: string) => {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
  if (!user) return null;

  const [[threadCount], [bookmarkCount], [notificationCount]] = await Promise.all([
    db.select({ value: count() }).from(schema.threads).where(eq(schema.threads.authorId, userId)),
    db.select({ value: count() }).from(schema.bookmarks).where(eq(schema.bookmarks.userId, userId)),
    db.select({ value: count() }).from(schema.notifications).where(and(eq(schema.notifications.userId, userId), isNull(schema.notifications.readAt))),
  ]);

  return {
    ...user,
    threadCount: threadCount?.value || 0,
    bookmarkCount: bookmarkCount?.value || 0,
    unreadNotifications: notificationCount?.value || 0,
  };
};

export const updateUserProfile = async (userId: string, update: ProfileUpdate) => {
  const [user] = await db
    .update(schema.users)
    .set({
      name: update.name?.trim() || undefined,
      username: update.username?.trim() || undefined,
      bio: update.bio?.trim() || undefined,
      school: update.school?.trim() || undefined,
      grade: update.grade?.trim() || undefined,
      favoriteSubjects: update.favoriteSubjects,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId))
    .returning();
  return user;
};

export const getUserThreads = async (userId: string) => getThreads({ sort: 'latest', authorId: userId });

export const toggleBookmark = async (userId: string, threadId: string) => {
  const [existing] = await db
    .select()
    .from(schema.bookmarks)
    .where(and(eq(schema.bookmarks.userId, userId), eq(schema.bookmarks.threadId, threadId)));

  if (existing) {
    await db.delete(schema.bookmarks).where(eq(schema.bookmarks.id, existing.id));
    return { bookmarked: false };
  }

  await db.insert(schema.bookmarks).values({ userId, threadId });
  return { bookmarked: true };
};

export const getBookmarkStatus = async (userId: string | undefined, threadId: string) => {
  if (!userId) return false;
  const [bookmark] = await db
    .select()
    .from(schema.bookmarks)
    .where(and(eq(schema.bookmarks.userId, userId), eq(schema.bookmarks.threadId, threadId)));
  return Boolean(bookmark);
};

export const getBookmarkedThreads = async (userId: string) => {
  const bookmarks = await db.select({ threadId: schema.bookmarks.threadId }).from(schema.bookmarks).where(eq(schema.bookmarks.userId, userId));
  return getThreads({ sort: 'latest', threadIds: bookmarks.map((bookmark) => bookmark.threadId) });
};

export const searchThreads = async (input: { query?: string; subject?: string; sort?: ThreadSort }) => {
  const query = input.query?.trim() || '';
  const subject = input.subject?.trim() || '';
  const allThreads = await getThreads({ sort: input.sort === 'hot' ? 'hot' : 'latest', subject: subject || undefined });

  if (!query && !subject) return allThreads;

  let matchingThreadIds = new Set<string>(allThreads.map((thread) => thread.id));
  if (query) {
    const pattern = `%${query.replace(/[%_]/g, '\\$&')}%`;
    const matches = await db
      .select({ threadId: schema.threads.id })
      .from(schema.threads)
      .leftJoin(schema.resources, eq(schema.resources.threadId, schema.threads.id))
      .where(or(ilike(schema.threads.title, pattern), ilike(schema.resources.content, pattern)));
    matchingThreadIds = new Set(matches.map((match) => match.threadId));
  }

  return allThreads.filter((thread) => matchingThreadIds.has(thread.id) && (!subject || thread.subject === subject));
};

export const createNotification = async (data: {
  userId: string;
  actorId?: string;
  type: string;
  targetType: string;
  targetId: string;
  threadId?: string;
  message: string;
}) => {
  if (data.userId === data.actorId) return null;
  const [notification] = await db.insert(schema.notifications).values(data).returning();
  return notification;
};

export const getNotifications = async (userId: string) => {
  return db.query.notifications.findMany({
    where: eq(schema.notifications.userId, userId),
    orderBy: [desc(schema.notifications.createdAt)],
    with: { actor: true, thread: true },
    limit: 50,
  });
};

export const markNotificationsRead = async (userId: string) => {
  await db.update(schema.notifications).set({ readAt: new Date() }).where(and(eq(schema.notifications.userId, userId), isNull(schema.notifications.readAt)));
};

export const getPendingReportByReporterTarget = async (data: {
  reporterId: string;
  targetType: 'thread' | 'comment';
  targetId: string;
}) => {
  return db.query.reports.findFirst({
    where: and(
      eq(schema.reports.reporterId, data.reporterId),
      eq(schema.reports.targetType, data.targetType),
      eq(schema.reports.targetId, data.targetId),
      eq(schema.reports.status, 'pending'),
    ),
    columns: { id: true },
  });
};

export const createReport = async (data: {
  reporterId: string;
  targetType: 'thread' | 'comment';
  targetId: string;
  threadId: string;
  reason: string;
  details?: string;
}) => {
  const [report] = await db.insert(schema.reports).values(data).returning();
  return report;
};

export const getReports = async () => {
  return db.query.reports.findMany({
    orderBy: [asc(schema.reports.status), desc(schema.reports.createdAt)],
    with: { reporter: true, moderator: true, thread: true },
  });
};

export const resolveReport = async (data: {
  reportId: string;
  moderatorId: string;
  status: 'reviewed' | 'dismissed' | 'actioned';
  resolutionNote?: string;
}) => {
  const [report] = await db
    .update(schema.reports)
    .set({
      status: data.status,
      moderatorId: data.moderatorId,
      resolutionNote: data.resolutionNote?.trim() || null,
      resolvedAt: new Date(),
    })
    .where(eq(schema.reports.id, data.reportId))
    .returning();
  return report;
};

export type AdminRole = 'student' | 'moderator' | 'admin';

export type AdminDashboard = {
  metrics: {
    totalMembers: number;
    totalThreads: number;
    totalReplies: number;
    totalVotes: number;
    newMembers24h: number;
    newThreads24h: number;
    newReplies24h: number;
    votes24h: number;
    pendingReports: number;
    resolvedReports7d: number;
  };
  subjectActivity: Array<{ subject: string; threads: number }>;
  recentThreads: ForumThread[];
  topDiscussions: ForumThread[];
  members: Array<{
    id: string;
    name: string | null;
    username: string | null;
    email: string;
    role: AdminRole;
    reputationScore: number;
    createdAt: Date | null;
    threadCount: number;
    replyCount: number;
  }>;
};

export const getAdminDashboard = async (): Promise<AdminDashboard> => {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const subjectThreadCount = count();

  const [
    [totalMembers],
    [totalThreads],
    [totalReplies],
    [totalVotes],
    [newMembers24h],
    [newThreads24h],
    [newReplies24h],
    [votes24h],
    [pendingReports],
    [resolvedReports7d],
    subjectActivity,
    members,
  ] = await Promise.all([
    db.select({ value: count() }).from(schema.users),
    db.select({ value: count() }).from(schema.threads),
    db.select({ value: count() }).from(schema.resources).where(eq(schema.resources.isThreadStarter, false)),
    db.select({ value: count() }).from(schema.votes),
    db.select({ value: count() }).from(schema.users).where(gte(schema.users.createdAt, dayAgo)),
    db.select({ value: count() }).from(schema.threads).where(gte(schema.threads.createdAt, dayAgo)),
    db.select({ value: count() }).from(schema.resources).where(and(eq(schema.resources.isThreadStarter, false), gte(schema.resources.createdAt, dayAgo))),
    db.select({ value: count() }).from(schema.votes).where(gte(schema.votes.createdAt, dayAgo)),
    db.select({ value: count() }).from(schema.reports).where(eq(schema.reports.status, 'pending')),
    db.select({ value: count() }).from(schema.reports).where(and(gte(schema.reports.resolvedAt, weekAgo), or(eq(schema.reports.status, 'reviewed'), eq(schema.reports.status, 'dismissed'), eq(schema.reports.status, 'actioned')))),
    db.select({ subject: schema.threads.subject, threads: subjectThreadCount }).from(schema.threads).groupBy(schema.threads.subject).orderBy(desc(subjectThreadCount)).limit(6),
    db.query.users.findMany({ orderBy: [desc(schema.users.createdAt)], limit: 24 }),
  ]);

  const memberIds = members.map((member) => member.id);
  const [threadCounts, replyCounts, recentThreads, topDiscussions] = await Promise.all([
    memberIds.length > 0
      ? db.select({ authorId: schema.threads.authorId, total: count() }).from(schema.threads).where(inArray(schema.threads.authorId, memberIds)).groupBy(schema.threads.authorId)
      : Promise.resolve([]),
    memberIds.length > 0
      ? db.select({ authorId: schema.resources.authorId, total: count() }).from(schema.resources).where(and(inArray(schema.resources.authorId, memberIds), eq(schema.resources.isThreadStarter, false))).groupBy(schema.resources.authorId)
      : Promise.resolve([]),
    getThreads('latest'),
    getThreads('hot'),
  ]);

  const threadCountByUser = new Map(threadCounts.map((row) => [row.authorId, Number(row.total)]));
  const replyCountByUser = new Map(replyCounts.map((row) => [row.authorId, Number(row.total)]));

  return {
    metrics: {
      totalMembers: Number(totalMembers?.value || 0),
      totalThreads: Number(totalThreads?.value || 0),
      totalReplies: Number(totalReplies?.value || 0),
      totalVotes: Number(totalVotes?.value || 0),
      newMembers24h: Number(newMembers24h?.value || 0),
      newThreads24h: Number(newThreads24h?.value || 0),
      newReplies24h: Number(newReplies24h?.value || 0),
      votes24h: Number(votes24h?.value || 0),
      pendingReports: Number(pendingReports?.value || 0),
      resolvedReports7d: Number(resolvedReports7d?.value || 0),
    },
    subjectActivity: subjectActivity.map((row) => ({ subject: row.subject, threads: Number(row.threads) })),
    recentThreads: recentThreads.slice(0, 6),
    topDiscussions: topDiscussions.slice(0, 6),
    members: members.map((member) => ({
      id: member.id,
      name: member.name,
      username: member.username,
      email: member.email,
      role: member.role === 'admin' || member.role === 'moderator' ? member.role : 'student',
      reputationScore: member.reputationScore || 0,
      createdAt: member.createdAt || null,
      threadCount: threadCountByUser.get(member.id) || 0,
      replyCount: replyCountByUser.get(member.id) || 0,
    })),
  };
};

export const setThreadSticky = async (data: { threadId: string; isSticky: boolean }) => {
  const [thread] = await db
    .update(schema.threads)
    .set({ isSticky: data.isSticky, updatedAt: new Date() })
    .where(eq(schema.threads.id, data.threadId))
    .returning();
  return thread;
};

export const setUserRole = async (data: { userId: string; role: AdminRole }) => {
  const [user] = await db
    .update(schema.users)
    .set({ role: data.role, updatedAt: new Date() })
    .where(eq(schema.users.id, data.userId))
    .returning();
  return user;
};

export const createModerationLog = async (data: { moderatorId: string; targetType: 'thread' | 'user' | 'report' | 'campaign' | 'editorial' | 'creator' | 'knowledge' | 'hub' | 'circle' | 'mentor' | 'peer_review'; targetId: string; action: string; reason?: string }) => {
  const [log] = await db.insert(schema.moderationLogs).values(data).returning();
  return log;
};

// --- Mutation Functions ---

export const createThread = async (data: {
  title: string;
  slug: string;
  authorId: string;
  subject: string;
  content: string;
  kind?: string;
  helpContext?: Record<string, unknown>;
}) => {
  return db.transaction(async (tx) => {
    const [thread] = await tx
      .insert(schema.threads)
      .values({
        title: data.title.trim(),
        slug: data.slug,
        authorId: data.authorId,
        subject: data.subject,
        kind: data.kind || 'discussion',
        helpContext: data.helpContext || null,
      })
      .returning();

    await tx.insert(schema.resources).values({
      threadId: thread.id,
      authorId: data.authorId,
      content: data.content.trim(),
      isThreadStarter: true,
    });

    return thread;
  });
};

export const createComment = async (data: {
  threadId: string;
  authorId: string;
  content: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
}) => {
  const [comment] = await db
    .insert(schema.resources)
    .values({
      threadId: data.threadId,
      authorId: data.authorId,
      content: data.content.trim(),
      parentId: data.parentId || null,
      metadata: data.metadata,
      isThreadStarter: false,
    })
    .returning();

  return comment;
};

export * from './types';
export * from './schema';

// --- Forum Campaign Settings ---

export type CampaignTemplate = 'cinematic' | 'swiss-grid' | 'widescreen-photo';
export type CampaignKind = 'community' | 'sponsor';

export type ForumCampaignSettings = {
  enabled: boolean;
  template: CampaignTemplate;
  kind: CampaignKind;
  eyebrow: string;
  title: string;
  body: string;
  actionLabel?: string;
  href?: string;
  accent?: string;
  imageSrc?: string;
  updatedAt?: Date | null;
};

export type ForumCampaignSettingsInput = Omit<ForumCampaignSettings, 'updatedAt'>;

const FORUM_CAMPAIGN_KEY = 'forum_top';
const defaultForumCampaignSettings: ForumCampaignSettings = {
  enabled: true,
  template: 'cinematic',
  kind: 'community',
  eyebrow: 'COMMUNITY PROGRAM / 2026',
  title: 'MAKE ROOM FOR THE NEXT IDEA.',
  body: 'A reserved top-of-forum space for student projects, campus initiatives, and future sponsor messages.',
  actionLabel: 'EXPLORE PROGRAM',
  href: '/search',
  accent: '#812D37',
  imageSrc: '/images/campaign-independent-cinema.jpg',
};

const mapForumCampaign = (row: typeof schema.campaignSettings.$inferSelect): ForumCampaignSettings => ({
  enabled: row.enabled,
  template: row.template as CampaignTemplate,
  kind: row.kind as CampaignKind,
  eyebrow: row.eyebrow,
  title: row.title,
  body: row.body,
  actionLabel: row.actionLabel || undefined,
  href: row.href || undefined,
  accent: row.accent || undefined,
  imageSrc: row.imageSrc || undefined,
  updatedAt: row.updatedAt,
});

export const getForumCampaignSettings = async (): Promise<ForumCampaignSettings> => {
  try {
    const row = await db.query.campaignSettings.findFirst({
      where: eq(schema.campaignSettings.key, FORUM_CAMPAIGN_KEY),
    });
    return row ? mapForumCampaign(row) : defaultForumCampaignSettings;
  } catch (error) {
    console.error('Campaign settings lookup failed:', error);
    return defaultForumCampaignSettings;
  }
};

export const upsertForumCampaignSettings = async (
  settings: ForumCampaignSettingsInput,
  updatedBy: string,
): Promise<ForumCampaignSettings & { id: string }> => {
  const [row] = await db
    .insert(schema.campaignSettings)
    .values({
      key: FORUM_CAMPAIGN_KEY,
      ...settings,
      actionLabel: settings.actionLabel || null,
      href: settings.href || null,
      accent: settings.accent || null,
      imageSrc: settings.imageSrc || null,
      updatedBy,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.campaignSettings.key,
      set: {
        enabled: settings.enabled,
        template: settings.template,
        kind: settings.kind,
        eyebrow: settings.eyebrow,
        title: settings.title,
        body: settings.body,
        actionLabel: settings.actionLabel || null,
        href: settings.href || null,
        accent: settings.accent || null,
        imageSrc: settings.imageSrc || null,
        updatedBy,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!row) throw new Error('Campaign settings could not be saved');
  return { id: row.id, ...mapForumCampaign(row) };
};


// --- Structured community and BASIS Bulletin ---

export type PublicEditorialPost = {
  id: string;
  slug: string;
  headline: string;
  dek: string;
  body: string;
  kind: string;
  tags: string[];
  imageSrc?: string;
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  correctionNote?: string;
  isSponsored: boolean;
  authorId: string;
  authorName: string;
  creatorName?: string;
  creatorType?: string;
  discussionThreadId?: string;
};

const mapPublicEditorialPost = (row: {
  post: typeof schema.editorialPosts.$inferSelect;
  authorName: string | null;
  authorUsername: string | null;
  creatorName: string | null;
  creatorType: string | null;
}): PublicEditorialPost => ({
  id: row.post.id,
  slug: row.post.slug,
  headline: row.post.headline,
  dek: row.post.dek,
  body: row.post.body,
  kind: row.post.kind,
  tags: Array.isArray(row.post.tags) ? row.post.tags.filter((tag): tag is string => typeof tag === 'string') : [],
  imageSrc: row.post.imageSrc || undefined,
  publishedAt: row.post.publishedAt,
  scheduledAt: row.post.scheduledAt,
  correctionNote: row.post.correctionNote || undefined,
  isSponsored: row.post.isSponsored,
  authorId: row.post.authorId,
  authorName: row.creatorName || row.authorName || row.authorUsername || 'Verified creator',
  creatorName: row.creatorName || undefined,
  creatorType: row.creatorType || undefined,
  discussionThreadId: row.post.discussionThreadId || undefined,
});

const publicEditorialConditions = (now = new Date()) =>
  and(
    eq(schema.editorialPosts.status, 'published'),
    or(isNull(schema.editorialPosts.scheduledAt), lte(schema.editorialPosts.scheduledAt, now)),
    or(isNull(schema.editorialPosts.publishedAt), lte(schema.editorialPosts.publishedAt, now)),
  );

export const getPublicEditorialPosts = async (kind?: string): Promise<PublicEditorialPost[]> => {
  try {
    const filters = kind ? and(publicEditorialConditions(), eq(schema.editorialPosts.kind, kind)) : publicEditorialConditions();
    const rows = await db
      .select({
        post: schema.editorialPosts,
        authorName: schema.users.name,
        authorUsername: schema.users.username,
        creatorName: schema.creatorProfiles.displayName,
        creatorType: schema.creatorProfiles.type,
      })
      .from(schema.editorialPosts)
      .leftJoin(schema.users, eq(schema.editorialPosts.authorId, schema.users.id))
      .leftJoin(schema.creatorProfiles, eq(schema.editorialPosts.creatorProfileId, schema.creatorProfiles.id))
      .where(filters)
      .orderBy(desc(schema.editorialPosts.publishedAt), desc(schema.editorialPosts.createdAt));
    return rows.map(mapPublicEditorialPost);
  } catch (error) {
    console.error('Bulletin lookup failed:', error);
    return [];
  }
};

export const getPublicEditorialPostBySlug = async (slug: string): Promise<PublicEditorialPost | null> => {
  try {
    const [row] = await db
      .select({
        post: schema.editorialPosts,
        authorName: schema.users.name,
        authorUsername: schema.users.username,
        creatorName: schema.creatorProfiles.displayName,
        creatorType: schema.creatorProfiles.type,
      })
      .from(schema.editorialPosts)
      .leftJoin(schema.users, eq(schema.editorialPosts.authorId, schema.users.id))
      .leftJoin(schema.creatorProfiles, eq(schema.editorialPosts.creatorProfileId, schema.creatorProfiles.id))
      .where(and(eq(schema.editorialPosts.slug, slug), publicEditorialConditions()))
      .limit(1);
    return row ? mapPublicEditorialPost(row) : null;
  } catch (error) {
    console.error('Bulletin post lookup failed:', error);
    return null;
  }
};

export const getHomepageFeaturedEditorialPost = async (): Promise<PublicEditorialPost | null> => {
  const now = new Date();
  try {
    const [row] = await db
      .select({
        post: schema.editorialPosts,
        authorName: schema.users.name,
        authorUsername: schema.users.username,
        creatorName: schema.creatorProfiles.displayName,
        creatorType: schema.creatorProfiles.type,
      })
      .from(schema.editorialHomepageFeatures)
      .innerJoin(schema.editorialPosts, eq(schema.editorialHomepageFeatures.postId, schema.editorialPosts.id))
      .leftJoin(schema.users, eq(schema.editorialPosts.authorId, schema.users.id))
      .leftJoin(schema.creatorProfiles, eq(schema.editorialPosts.creatorProfileId, schema.creatorProfiles.id))
      .where(and(
        eq(schema.editorialHomepageFeatures.slot, 'forum_home_primary'),
        publicEditorialConditions(now),
        or(isNull(schema.editorialHomepageFeatures.startsAt), lte(schema.editorialHomepageFeatures.startsAt, now)),
        or(isNull(schema.editorialHomepageFeatures.endsAt), gt(schema.editorialHomepageFeatures.endsAt, now)),
      ))
      .limit(1);
    return row ? mapPublicEditorialPost(row) : null;
  } catch (error) {
    console.error('Homepage feature lookup failed:', error);
    return null;
  }
};

export const getCreatorProfileByUserId = async (userId: string) =>
  db.query.creatorProfiles.findFirst({ where: eq(schema.creatorProfiles.userId, userId) });

export const getVerifiedCreatorProfile = async (userId: string) =>
  db.query.creatorProfiles.findFirst({ where: and(eq(schema.creatorProfiles.userId, userId), eq(schema.creatorProfiles.status, 'verified')) });

export const getBlockedUserIds = async (userId: string) => {
  const rows = await db.select({ blockedId: schema.userBlocks.blockedId }).from(schema.userBlocks).where(eq(schema.userBlocks.blockerId, userId));
  return new Set(rows.map((row) => row.blockedId));
};

export const toggleUserBlock = async (blockerId: string, blockedId: string) => {
  const [existing] = await db.select().from(schema.userBlocks).where(and(eq(schema.userBlocks.blockerId, blockerId), eq(schema.userBlocks.blockedId, blockedId)));
  if (existing) {
    await db.delete(schema.userBlocks).where(eq(schema.userBlocks.id, existing.id));
    return { blocked: false };
  }
  await db.insert(schema.userBlocks).values({ blockerId, blockedId });
  return { blocked: true };
};

export const resolveThreadWithReply = async (data: { threadId: string; replyId: string; resolvedBy: string }) => {
  const [resolution] = await db
    .insert(schema.threadResolutions)
    .values(data)
    .onConflictDoUpdate({
      target: schema.threadResolutions.threadId,
      set: { replyId: data.replyId, resolvedBy: data.resolvedBy, createdAt: new Date() },
    })
    .returning();
  return resolution;
};

export const clearThreadResolution = async (threadId: string) => {
  await db.delete(schema.threadResolutions).where(eq(schema.threadResolutions.threadId, threadId));
};

export const getThreadResolution = async (threadId: string) =>
  db.query.threadResolutions.findFirst({ where: eq(schema.threadResolutions.threadId, threadId) });


export type EditorialDraftInput = {
  headline: string;
  dek: string;
  body: string;
  kind: string;
  tags?: string[];
  sourceLinks?: string[];
  imageSrc?: string;
  scheduledAt?: Date;
  isSponsored?: boolean;
};

export const getCreatorDeskPosts = async (authorId: string) =>
  db.query.editorialPosts.findMany({
    where: eq(schema.editorialPosts.authorId, authorId),
    orderBy: [desc(schema.editorialPosts.updatedAt)],
  });

export const createCreatorProfileRequest = async (data: {
  userId: string;
  type: string;
  displayName: string;
  statement: string;
}) => {
  const [profile] = await db
    .insert(schema.creatorProfiles)
    .values({ ...data, status: 'requested', updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.creatorProfiles.userId,
      set: { type: data.type, displayName: data.displayName, statement: data.statement, status: 'requested', suspensionNote: null, updatedAt: new Date() },
    })
    .returning();
  return profile;
};

export const createEditorialDraft = async (data: EditorialDraftInput & { authorId: string; creatorProfileId?: string }) => {
  const slug = `${data.headline.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'bulletin'}-${crypto.randomUUID().slice(0, 8)}`;
  const [post] = await db.insert(schema.editorialPosts).values({
    slug,
    headline: data.headline.trim(),
    dek: data.dek.trim(),
    body: data.body.trim(),
    kind: data.kind,
    status: 'draft',
    authorId: data.authorId,
    creatorProfileId: data.creatorProfileId || null,
    tags: data.tags || [],
    sourceLinks: data.sourceLinks || [],
    imageSrc: data.imageSrc?.trim() || null,
    scheduledAt: data.scheduledAt || null,
    isSponsored: Boolean(data.isSponsored),
    updatedAt: new Date(),
  }).returning();
  return post;
};

export const updateEditorialDraft = async (postId: string, authorId: string, data: EditorialDraftInput) => {
  const [post] = await db
    .update(schema.editorialPosts)
    .set({
      headline: data.headline.trim(), dek: data.dek.trim(), body: data.body.trim(), kind: data.kind,
      tags: data.tags || [], sourceLinks: data.sourceLinks || [], imageSrc: data.imageSrc?.trim() || null,
      scheduledAt: data.scheduledAt || null, isSponsored: Boolean(data.isSponsored), updatedAt: new Date(),
    })
    .where(and(eq(schema.editorialPosts.id, postId), eq(schema.editorialPosts.authorId, authorId), or(eq(schema.editorialPosts.status, 'draft'), eq(schema.editorialPosts.status, 'in_review'))))
    .returning();
  return post;
};

export const submitEditorialForReview = async (postId: string, authorId: string) => {
  const [post] = await db
    .update(schema.editorialPosts)
    .set({ status: 'in_review', reviewNote: null, updatedAt: new Date() })
    .where(and(eq(schema.editorialPosts.id, postId), eq(schema.editorialPosts.authorId, authorId), eq(schema.editorialPosts.status, 'draft')))
    .returning();
  return post;
};

export const getEditorialReviewQueue = async () =>
  db
    .select({
      id: schema.editorialPosts.id,
      headline: schema.editorialPosts.headline,
      dek: schema.editorialPosts.dek,
      kind: schema.editorialPosts.kind,
      createdAt: schema.editorialPosts.createdAt,
      authorName: schema.users.name,
      authorUsername: schema.users.username,
    })
    .from(schema.editorialPosts)
    .leftJoin(schema.users, eq(schema.editorialPosts.authorId, schema.users.id))
    .where(eq(schema.editorialPosts.status, 'in_review'))
    .orderBy(asc(schema.editorialPosts.createdAt));

export const reviewEditorialPost = async (data: {
  postId: string;
  reviewerId: string;
  decision: 'request_changes' | 'publish' | 'archive';
  reviewNote?: string;
  publishAt?: Date;
}) => {
  const nextStatus = data.decision === 'request_changes' ? 'draft' : data.decision === 'archive' ? 'archived' : 'published';
  const now = new Date();
  const [post] = await db
    .update(schema.editorialPosts)
    .set({
      status: nextStatus,
      reviewNote: data.reviewNote?.trim() || null,
      reviewedBy: data.reviewerId,
      publisherId: data.decision === 'publish' ? data.reviewerId : null,
      publishedAt: data.decision === 'publish' ? data.publishAt || now : null,
      archivedAt: data.decision === 'archive' ? now : null,
      updatedAt: now,
    })
    .where(eq(schema.editorialPosts.id, data.postId))
    .returning();
  return post;
};

export const createEditorialRevision = async (data: {
  postId: string;
  createdBy: string;
  snapshot: Record<string, unknown>;
  state: string;
  reviewNote?: string;
}) => {
  const [latest] = await db
    .select({ revisionNumber: schema.editorialPostRevisions.revisionNumber })
    .from(schema.editorialPostRevisions)
    .where(eq(schema.editorialPostRevisions.postId, data.postId))
    .orderBy(desc(schema.editorialPostRevisions.revisionNumber))
    .limit(1);
  const [revision] = await db.insert(schema.editorialPostRevisions).values({
    postId: data.postId,
    revisionNumber: (latest?.revisionNumber || 0) + 1,
    snapshot: data.snapshot,
    state: data.state,
    reviewNote: data.reviewNote?.trim() || null,
    createdBy: data.createdBy,
  }).returning();
  return revision;
};

export const upsertEditorialEvent = async (data: {
  postId: string; startsAt: Date; endsAt: Date; timezone?: string; locationLabel?: string;
  registrationUrl?: string; capacityNote?: string; organizerLabel?: string; status?: string;
}) => {
  const [event] = await db.insert(schema.editorialEvents).values({
    ...data,
    timezone: data.timezone || 'Asia/Shanghai',
    locationLabel: data.locationLabel || null,
    registrationUrl: data.registrationUrl || null,
    capacityNote: data.capacityNote || null,
    organizerLabel: data.organizerLabel || null,
    status: data.status || 'scheduled',
  }).onConflictDoUpdate({
    target: schema.editorialEvents.postId,
    set: { startsAt: data.startsAt, endsAt: data.endsAt, timezone: data.timezone || 'Asia/Shanghai', locationLabel: data.locationLabel || null, registrationUrl: data.registrationUrl || null, capacityNote: data.capacityNote || null, organizerLabel: data.organizerLabel || null, status: data.status || 'scheduled' },
  }).returning();
  return event;
};

export const setEditorialHomepageFeature = async (data: {
  postId: string; featuredBy: string; startsAt?: Date; endsAt?: Date; selectionNote?: string;
}) => {
  const [feature] = await db.insert(schema.editorialHomepageFeatures).values({
    slot: 'forum_home_primary', postId: data.postId, featuredBy: data.featuredBy,
    startsAt: data.startsAt || null, endsAt: data.endsAt || null, selectionNote: data.selectionNote?.trim() || null, updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: schema.editorialHomepageFeatures.slot,
    set: { postId: data.postId, featuredBy: data.featuredBy, startsAt: data.startsAt || null, endsAt: data.endsAt || null, selectionNote: data.selectionNote?.trim() || null, updatedAt: new Date() },
  }).returning();
  return feature;
};

export const clearEditorialHomepageFeature = async () =>
  db.delete(schema.editorialHomepageFeatures).where(eq(schema.editorialHomepageFeatures.slot, 'forum_home_primary'));

export const setCreatorProfileStatus = async (data: { profileId: string; status: string; verifiedBy: string; note?: string; expiresAt?: Date }) => {
  const now = new Date();
  const [profile] = await db.update(schema.creatorProfiles).set({
    status: data.status,
    verifiedBy: data.verifiedBy,
    verifiedAt: data.status === 'verified' ? now : null,
    expiresAt: data.expiresAt || null,
    suspensionNote: data.note?.trim() || null,
    updatedAt: now,
  }).where(eq(schema.creatorProfiles.id, data.profileId)).returning();
  return profile;
};

export const getCreatorVerificationQueue = async () =>
  db
    .select({
      id: schema.creatorProfiles.id,
      displayName: schema.creatorProfiles.displayName,
      type: schema.creatorProfiles.type,
      statement: schema.creatorProfiles.statement,
      createdAt: schema.creatorProfiles.createdAt,
      userName: schema.users.name,
      userUsername: schema.users.username,
    })
    .from(schema.creatorProfiles)
    .leftJoin(schema.users, eq(schema.creatorProfiles.userId, schema.users.id))
    .where(eq(schema.creatorProfiles.status, 'requested'))
    .orderBy(asc(schema.creatorProfiles.createdAt));


// --- Academic collaboration, knowledge, and mentorship ---

export const getPublishedKnowledgeCards = async (subject?: string) => {
  const conditions = subject ? and(eq(schema.knowledgeCards.status, 'published'), eq(schema.knowledgeCards.subject, subject)) : eq(schema.knowledgeCards.status, 'published');
  return db.query.knowledgeCards.findMany({ where: conditions, orderBy: [desc(schema.knowledgeCards.publishedAt)] });
};

export const createKnowledgeCardDraft = async (data: {
  slug: string; subject: string; title: string; summary: string; content: string; createdBy: string; sourceThreadId?: string; sourceReplyId?: string;
}) => {
  const [card] = await db.insert(schema.knowledgeCards).values({ ...data, status: 'draft', sourceThreadId: data.sourceThreadId || null, sourceReplyId: data.sourceReplyId || null, updatedAt: new Date() }).returning();
  return card;
};

export const reviewKnowledgeCard = async (data: { cardId: string; status: 'published' | 'draft' | 'archived'; reviewedBy: string }) => {
  const now = new Date();
  const [card] = await db.update(schema.knowledgeCards).set({ status: data.status, reviewedBy: data.reviewedBy, publishedAt: data.status === 'published' ? now : null, updatedAt: now }).where(eq(schema.knowledgeCards.id, data.cardId)).returning();
  return card;
};

export const getActiveStudyHubs = async () => {
  const now = new Date();
  return db.query.studyHubs.findMany({
    where: and(eq(schema.studyHubs.status, 'published'), gt(schema.studyHubs.endsAt, now)),
    orderBy: [asc(schema.studyHubs.startsAt)],
  });
};

export const createStudyHub = async (data: { slug: string; title: string; subject: string; description: string; startsAt: Date; endsAt: Date; createdBy: string }) => {
  const [hub] = await db.insert(schema.studyHubs).values({ ...data, status: 'draft', updatedAt: new Date() }).returning();
  return hub;
};

export const publishStudyHub = async (hubId: string, actorId: string, status: 'published' | 'archived') => {
  const now = new Date();
  const [hub] = await db.update(schema.studyHubs).set({ status, publishedAt: status === 'published' ? now : null, updatedAt: now }).where(eq(schema.studyHubs.id, hubId)).returning();
  if (hub) await createModerationLog({ moderatorId: actorId, targetType: 'hub', targetId: hub.id, action: `hub_${status}` });
  return hub;
};

export const getOpenStudyCircles = async () => {
  const rows = await db
    .select({ circle: schema.studyCircles, hostName: schema.users.name, hostUsername: schema.users.username, acceptedCount: count(schema.studyCircleRequests.id) })
    .from(schema.studyCircles)
    .leftJoin(schema.users, eq(schema.studyCircles.hostId, schema.users.id))
    .leftJoin(schema.studyCircleRequests, and(eq(schema.studyCircles.id, schema.studyCircleRequests.circleId), eq(schema.studyCircleRequests.status, 'accepted')))
    .where(and(eq(schema.studyCircles.status, 'open'), gt(schema.studyCircles.endsAt, new Date())))
    .groupBy(schema.studyCircles.id, schema.users.name, schema.users.username)
    .orderBy(asc(schema.studyCircles.startsAt));
  return rows.map((row) => ({ ...row.circle, hostName: row.hostName || row.hostUsername || 'Student', acceptedCount: Number(row.acceptedCount) }));
};

export const createStudyCircle = async (data: { slug: string; hostId: string; subject: string; title: string; description: string; startsAt: Date; endsAt: Date; capacity: number; locationLabel?: string }) => {
  const [circle] = await db.insert(schema.studyCircles).values({ ...data, locationLabel: data.locationLabel || null, status: 'open', updatedAt: new Date() }).returning();
  return circle;
};

export const requestStudyCircle = async (circleId: string, requesterId: string, note?: string) => {
  const [circle] = await db.select().from(schema.studyCircles).where(eq(schema.studyCircles.id, circleId));
  if (!circle || circle.status !== 'open') throw new Error('This study circle is no longer open.');
  if (circle.hostId === requesterId) throw new Error('Hosts already belong to their own study circle.');
  const [{ acceptedCount }] = await db.select({ acceptedCount: count(schema.studyCircleRequests.id) }).from(schema.studyCircleRequests).where(and(eq(schema.studyCircleRequests.circleId, circleId), eq(schema.studyCircleRequests.status, 'accepted')));
  if (Number(acceptedCount) >= circle.capacity - 1) throw new Error('This study circle is already full.');
  const [request] = await db.insert(schema.studyCircleRequests).values({ circleId, requesterId, note: note?.trim() || null, status: 'pending' }).onConflictDoUpdate({ target: [schema.studyCircleRequests.circleId, schema.studyCircleRequests.requesterId], set: { note: note?.trim() || null, status: 'pending', decidedBy: null, decidedAt: null } }).returning();
  return request;
};

export const decideStudyCircleRequest = async (data: { requestId: string; hostId: string; status: 'accepted' | 'declined' }) => {
  const [request] = await db
    .select({ request: schema.studyCircleRequests, circle: schema.studyCircles })
    .from(schema.studyCircleRequests)
    .innerJoin(schema.studyCircles, eq(schema.studyCircleRequests.circleId, schema.studyCircles.id))
    .where(eq(schema.studyCircleRequests.id, data.requestId));
  if (!request || request.circle.hostId !== data.hostId) throw new Error('Only the circle host can decide requests.');
  const [updated] = await db.update(schema.studyCircleRequests).set({ status: data.status, decidedBy: data.hostId, decidedAt: new Date() }).where(eq(schema.studyCircleRequests.id, request.request.id)).returning();
  return updated;
};

export const getOpenPeerReviews = async () => {
  const rows = await db
    .select({ review: schema.peerReviews, thread: schema.threads, requesterName: schema.users.name, requesterUsername: schema.users.username })
    .from(schema.peerReviews)
    .innerJoin(schema.threads, eq(schema.peerReviews.threadId, schema.threads.id))
    .leftJoin(schema.users, eq(schema.peerReviews.requesterId, schema.users.id))
    .where(eq(schema.peerReviews.status, 'open'))
    .orderBy(desc(schema.peerReviews.createdAt));
  return rows.map((row) => ({ ...row.review, threadTitle: row.thread.title, threadSlug: row.thread.slug, requesterName: row.requesterName || row.requesterUsername || 'Student' }));
};

export const createPeerReview = async (data: { threadId: string; requesterId: string; rubric: string[]; externalUrl?: string; closesAt?: Date }) => {
  const [review] = await db.insert(schema.peerReviews).values({ threadId: data.threadId, requesterId: data.requesterId, rubric: data.rubric, externalUrl: data.externalUrl || null, closesAt: data.closesAt || null, status: 'open', updatedAt: new Date() }).returning();
  return review;
};

export const leavePeerReviewFeedback = async (data: { reviewId: string; reviewerId: string; criterion: string; feedback: string }) => {
  const [feedback] = await db.insert(schema.peerReviewFeedback).values(data).onConflictDoUpdate({ target: [schema.peerReviewFeedback.reviewId, schema.peerReviewFeedback.reviewerId, schema.peerReviewFeedback.criterion], set: { feedback: data.feedback } }).returning();
  return feedback;
};

export const getVerifiedMentors = async () => {
  const rows = await db
    .select({ profile: schema.mentorProfiles, userName: schema.users.name, userUsername: schema.users.username })
    .from(schema.mentorProfiles)
    .leftJoin(schema.users, eq(schema.mentorProfiles.userId, schema.users.id))
    .where(and(eq(schema.mentorProfiles.status, 'verified'), or(isNull(schema.mentorProfiles.expiresAt), gt(schema.mentorProfiles.expiresAt, new Date()))));
  return rows.map((row) => ({ ...row.profile, displayName: row.userName || row.userUsername || 'Verified mentor' }));
};

export const requestMentorProfile = async (data: { userId: string; subjects: string[]; statement: string }) => {
  const [profile] = await db.insert(schema.mentorProfiles).values({ ...data, status: 'requested', updatedAt: new Date() }).onConflictDoUpdate({ target: schema.mentorProfiles.userId, set: { subjects: data.subjects, statement: data.statement, status: 'requested', reviewNote: null, updatedAt: new Date() } }).returning();
  return profile;
};

export const requestMentorSupport = async (data: { mentorProfileId: string; requesterId: string; subject: string; question: string }) => {
  const [request] = await db.insert(schema.mentorRequests).values({ ...data, status: 'pending' }).returning();
  return request;
};


export const getKnowledgeCardReviewQueue = async () =>
  db
    .select({ id: schema.knowledgeCards.id, subject: schema.knowledgeCards.subject, title: schema.knowledgeCards.title, summary: schema.knowledgeCards.summary, createdAt: schema.knowledgeCards.createdAt, creatorName: schema.users.name, creatorUsername: schema.users.username })
    .from(schema.knowledgeCards)
    .leftJoin(schema.users, eq(schema.knowledgeCards.createdBy, schema.users.id))
    .where(eq(schema.knowledgeCards.status, 'draft'))
    .orderBy(asc(schema.knowledgeCards.createdAt));

export const getStudyHubReviewQueue = async () =>
  db
    .select({ id: schema.studyHubs.id, subject: schema.studyHubs.subject, title: schema.studyHubs.title, description: schema.studyHubs.description, startsAt: schema.studyHubs.startsAt, endsAt: schema.studyHubs.endsAt, createdAt: schema.studyHubs.createdAt, creatorName: schema.users.name, creatorUsername: schema.users.username })
    .from(schema.studyHubs)
    .leftJoin(schema.users, eq(schema.studyHubs.createdBy, schema.users.id))
    .where(eq(schema.studyHubs.status, 'draft'))
    .orderBy(asc(schema.studyHubs.startsAt));

export const getMentorVerificationQueue = async () =>
  db
    .select({ id: schema.mentorProfiles.id, subjects: schema.mentorProfiles.subjects, statement: schema.mentorProfiles.statement, createdAt: schema.mentorProfiles.createdAt, userName: schema.users.name, userUsername: schema.users.username })
    .from(schema.mentorProfiles)
    .leftJoin(schema.users, eq(schema.mentorProfiles.userId, schema.users.id))
    .where(eq(schema.mentorProfiles.status, 'requested'))
    .orderBy(asc(schema.mentorProfiles.createdAt));

export const setMentorProfileStatus = async (data: { profileId: string; status: 'verified' | 'declined' | 'suspended'; reviewedBy: string; reviewNote?: string; expiresAt?: Date }) => {
  const now = new Date();
  const [profile] = await db.update(schema.mentorProfiles).set({ status: data.status, verifiedBy: data.reviewedBy, verifiedAt: data.status === 'verified' ? now : null, expiresAt: data.expiresAt || null, reviewNote: data.reviewNote?.trim() || null, updatedAt: now }).where(eq(schema.mentorProfiles.id, data.profileId)).returning();
  return profile;
};
