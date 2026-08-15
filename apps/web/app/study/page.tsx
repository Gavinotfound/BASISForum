import { BasisProvider } from '@basis-forum/ui';
import { isDisplayMode } from '@basis-forum/ui/src/theme-config';
import { getActiveStudyHubs, getOpenPeerReviews, getOpenStudyCircles, getVerifiedMentors } from '@basis-forum/database';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import ClientLayout from '../components/ClientLayout';
import StudyCenter from '../components/StudyCenter';

export const dynamic = 'force-dynamic';

export default async function StudyPage() {
  const [session, hubs, circles, reviews, mentors, cookieStore] = await Promise.all([auth(), getActiveStudyHubs(), getOpenStudyCircles(), getOpenPeerReviews(), getVerifiedMentors(), cookies()]);
  const storedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = isDisplayMode(storedMode) ? storedMode : 'dark';
  return <BasisProvider mode={mode}><ClientLayout user={session?.user}><StudyCenter hubs={hubs} circles={circles} reviews={reviews} mentors={mentors} signedIn={Boolean(session?.user)} /></ClientLayout></BasisProvider>;
}
