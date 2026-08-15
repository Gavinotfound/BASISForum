import { BasisProvider } from '@basis-forum/ui';
import { isDisplayMode } from '@basis-forum/ui/src/theme-config';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientLayout from '../../../components/ClientLayout';
import { MentorVerificationForm } from '../../../components/MentorWorkflowForms';

export const dynamic = 'force-dynamic';

export default async function MentorVerificationPage() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/login');
  const storedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = isDisplayMode(storedMode) ? storedMode : 'dark';

  return <BasisProvider mode={mode}><ClientLayout user={session?.user}><MentorVerificationForm /></ClientLayout></BasisProvider>;
}
