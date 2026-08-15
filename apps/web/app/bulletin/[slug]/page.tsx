import Link from 'next/link';
import { BasisProvider } from '@basis-forum/ui';
import { isDisplayMode } from '@basis-forum/ui/src/theme-config';
import { getPublicEditorialPostBySlug } from '@basis-forum/database';
import { Box, Typography } from '@mui/material';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ClientLayout from '../../components/ClientLayout';

export const dynamic = 'force-dynamic';

export default async function BulletinStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [session, post, cookieStore] = await Promise.all([auth(), getPublicEditorialPostBySlug(slug), cookies()]);
  if (!post) notFound();
  const storedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = isDisplayMode(storedMode) ? storedMode : 'dark';
  const date = post.publishedAt ? new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(post.publishedAt) : 'JUST PUBLISHED';
  const sourceLinks = Array.isArray(post.tags) ? post.tags : [];

  return <BasisProvider mode={mode}><ClientLayout user={session?.user}>
    <Box component="article" sx={{ maxWidth: 1080, mx: 'auto' }}>
      <Box sx={{ borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)', py: { xs: 1.5, md: 2.25 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '160px minmax(0,1fr)' }, gap: 2 }}>
        <Box><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>BASIS BULLETIN</Typography><Typography variant="caption" sx={{ display: 'block', mt: .5, color: 'var(--bf-muted)' }}>{post.kind.replace(/_/g, ' ').toUpperCase()} / {date}</Typography></Box>
        <Box><Typography component="h1" sx={{ fontWeight: 900, letterSpacing: '-.065em', fontSize: { xs: '2rem', md: '3.2rem' }, lineHeight: .98 }}>{post.headline}</Typography><Typography variant="h6" sx={{ mt: 1.25, color: 'var(--bf-muted)', fontWeight: 500, maxWidth: 820 }}>{post.dek}</Typography></Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '160px minmax(0,1fr)' }, gap: 2, py: { xs: 2, md: 3 } }}>
        <Box sx={{ color: 'var(--bf-muted)' }}><Typography variant="overline">BY</Typography><Typography variant="body2" sx={{ color: 'var(--bf-text)', fontWeight: 800 }}>{post.authorName}</Typography>{post.creatorType ? <Typography variant="caption" sx={{ display: 'block' }}>{post.creatorType.replace(/_/g, ' ')}</Typography> : null}{post.isSponsored ? <Typography variant="caption" sx={{ display: 'block', color: 'var(--bf-interactive)', mt: 1 }}>SPONSORED DISCLOSURE</Typography> : null}</Box>
        <Box><Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.75, fontSize: { xs: '1rem', md: '1.08rem' } }}>{post.body}</Typography>{post.correctionNote ? <Box sx={{ mt: 3, p: 1.5, borderTop: '1px solid var(--bf-interactive)', borderBottom: '1px solid var(--bf-interactive)' }}><Typography variant="overline" sx={{ color: 'var(--bf-interactive)' }}>CORRECTION</Typography><Typography variant="body2" sx={{ mt: .5 }}>{post.correctionNote}</Typography></Box> : null}<Box sx={{ mt: 3, borderTop: '1px solid var(--bf-divider)', pt: 1.5 }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>TAGS</Typography><Typography variant="body2" sx={{ mt: .5 }}>{sourceLinks.length ? sourceLinks.join(' · ') : 'BASIS Bulletin'}</Typography></Box>{post.discussionThreadId ? <Link href={`/threads/${post.discussionThreadId}`} style={{ display: 'inline-block', marginTop: 24, color: 'inherit', textDecoration: 'none', fontWeight: 800, fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', borderBottom: '1px solid currentColor', paddingBottom: 6 }}>Discuss this story</Link> : null}</Box>
      </Box>
    </Box>
  </ClientLayout></BasisProvider>;
}
