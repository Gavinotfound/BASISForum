import { BasisProvider } from '@basis-forum/ui';
import { isDisplayMode } from '@basis-forum/ui/src/theme-config';
import { getPublishedKnowledgeCards } from '@basis-forum/database';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import ClientLayout from '../components/ClientLayout';
import KnowledgeCenter from '../components/KnowledgeCenter';

export const dynamic = 'force-dynamic';

export default async function KnowledgePage() {
  const [session, cards, cookieStore] = await Promise.all([auth(), getPublishedKnowledgeCards(), cookies()]);
  const storedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = isDisplayMode(storedMode) ? storedMode : 'dark';
  return <BasisProvider mode={mode}><ClientLayout user={session?.user}><KnowledgeCenter cards={cards} signedIn={Boolean(session?.user)} /></ClientLayout></BasisProvider>;
}
