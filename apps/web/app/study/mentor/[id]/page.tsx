import { BasisProvider } from '@basis-forum/ui';
import { isDisplayMode } from '@basis-forum/ui/src/theme-config';
import { getVerifiedMentors } from '@basis-forum/database';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ClientLayout from '../../../components/ClientLayout';
import { MentorHelpForm } from '../../../components/MentorWorkflowForms';

export const dynamic = 'force-dynamic';

export default async function MentorHelpPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session, cookieStore, mentors] = await Promise.all([params, auth(), cookies(), getVerifiedMentors()]);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/login');
  const mentor = mentors.find((candidate) => candidate.id === id);
  if (!mentor) notFound();
  const storedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = isDisplayMode(storedMode) ? storedMode : 'dark';

  return <BasisProvider mode={mode}><ClientLayout user={session?.user}><MentorHelpForm mentor={mentor} /></ClientLayout></BasisProvider>;
}
