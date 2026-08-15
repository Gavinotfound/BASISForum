import { BasisProvider } from '@basis-forum/ui';
import { isDisplayMode } from '@basis-forum/ui/src/theme-config';
import { getActiveStudyHubs, getNotifications, getOpenPeerReviews, getOpenStudyCircles, getVerifiedMentors } from '@basis-forum/database';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import ClientLayout from '../components/ClientLayout';
import StudyCenter from '../components/StudyCenter';

export const dynamic = 'force-dynamic';

export default async function StudyPage() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const [hubs, circles, reviews, mentors, updates] = await Promise.all([getActiveStudyHubs(), getOpenStudyCircles(), getOpenPeerReviews(), getVerifiedMentors(), userId ? getNotifications(userId) : Promise.resolve([])]);
  const storedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = isDisplayMode(storedMode) ? storedMode : 'dark';
  return <BasisProvider mode={mode}><ClientLayout user={session?.user}><StudyCenter hubs={hubs} circles={circles} reviews={reviews} mentors={mentors} updates={updates} signedIn={Boolean(userId)} /></ClientLayout></BasisProvider>;
}
