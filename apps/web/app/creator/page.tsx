import { BasisProvider } from '@basis-forum/ui';
import { isDisplayMode } from '@basis-forum/ui/src/theme-config';
import { getCreatorDeskPosts, getCreatorProfileByUserId } from '@basis-forum/database';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientLayout from '../components/ClientLayout';
import CreatorDesk from '../components/CreatorDesk';

export const dynamic = 'force-dynamic';

export default async function CreatorPage() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;
  if (!user?.id) redirect('/login');
  const [profile, posts] = await Promise.all([getCreatorProfileByUserId(user.id), getCreatorDeskPosts(user.id)]);
  const storedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = isDisplayMode(storedMode) ? storedMode : 'dark';

  return <BasisProvider mode={mode}><ClientLayout user={user}><CreatorDesk profile={profile ? { id: profile.id, type: profile.type, status: profile.status, displayName: profile.displayName } : null} posts={posts.map((post) => ({ ...post, updatedAt: post.updatedAt || new Date() }))} /></ClientLayout></BasisProvider>;
}
