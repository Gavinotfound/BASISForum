import { getThreadById, toggleBookmark } from '@basis-forum/database';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Please sign in before saving a discussion.', bookmarked: false }, { status: 401 });

  const { threadId } = await params;
  const thread = await getThreadById(threadId);
  if (!thread) return NextResponse.json({ error: 'This discussion no longer exists.', bookmarked: false }, { status: 404 });

  try {
    const result = await toggleBookmark(userId, threadId);
    revalidatePath('/bookmarks');
    revalidatePath(`/threads/${thread.slug}`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Bookmark mutation failed:', error);
    return NextResponse.json({ error: 'Saving this discussion failed. Please try again.', bookmarked: false }, { status: 500 });
  }
}
