import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { Thread, User, Resource } from './types';
import { and, asc, count, desc, eq, ilike, inArray, isNull, or } from 'drizzle-orm';

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

export const getThreads = async (sort: ThreadSort = 'latest'): Promise<ForumThread[]> => {
  try {
    const result = await db.query.threads.findMany({
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

export const getCommentsByThreadId = async (threadId: string): Promise<ForumComment[]> => {
  try {
    const comments = await db.query.resources.findMany({
      where: eq(schema.resources.threadId, threadId),
      orderBy: [asc(schema.resources.createdAt)],
      with: { author: true },
    });

    return comments.map((comment) => ({
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

export const getUserThreads = async (userId: string) => {
  const threads = await getThreads('latest');
  return threads.filter((thread) => thread.author_id === userId);
};

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
  const bookmarks = await db.select().from(schema.bookmarks).where(eq(schema.bookmarks.userId, userId));
  const ids = new Set(bookmarks.map((bookmark) => bookmark.threadId));
  const threads = await getThreads('latest');
  return threads.filter((thread) => ids.has(thread.id));
};

export const searchThreads = async (input: { query?: string; subject?: string; sort?: ThreadSort }) => {
  const query = input.query?.trim() || '';
  const subject = input.subject?.trim() || '';
  const allThreads = await getThreads(input.sort === 'hot' ? 'hot' : 'latest');

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
    with: { actor: true },
    limit: 50,
  });
};

export const markNotificationsRead = async (userId: string) => {
  await db.update(schema.notifications).set({ readAt: new Date() }).where(and(eq(schema.notifications.userId, userId), isNull(schema.notifications.readAt)));
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

// --- Mutation Functions ---

export const createThread = async (data: {
  title: string;
  slug: string;
  authorId: string;
  subject: string;
  content: string;
}) => {
  return db.transaction(async (tx) => {
    const [thread] = await tx
      .insert(schema.threads)
      .values({
        title: data.title.trim(),
        slug: data.slug,
        authorId: data.authorId,
        subject: data.subject,
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
