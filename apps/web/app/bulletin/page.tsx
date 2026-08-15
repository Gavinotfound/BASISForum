import Link from 'next/link';
import { BasisProvider } from '@basis-forum/ui';
import { isDisplayMode } from '@basis-forum/ui/src/theme-config';
import { getPublicEditorialPosts } from '@basis-forum/database';
import { Box, Typography } from '@mui/material';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import ClientLayout from '../components/ClientLayout';

export const dynamic = 'force-dynamic';

const displayDate = (value?: Date | null) => value ? new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(value) : 'JUST PUBLISHED';

export default async function BulletinIndexPage() {
  const [session, posts, cookieStore] = await Promise.all([auth(), getPublicEditorialPosts(), cookies()]);
  const storedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = isDisplayMode(storedMode) ? storedMode : 'dark';
  return <BasisProvider mode={mode}><ClientLayout user={session?.user}>
    <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
      <Box component="header" sx={{ borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)', pt: { xs: 1.5, md: 2.25 }, pb: { xs: 1.5, md: 2.25 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '160px minmax(0,1fr)' }, gap: 2 }}>
        <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>BASIS / EDITORIAL</Typography>
        <Box><Typography component="h1" sx={{ fontWeight: 900, letterSpacing: '-.07em', fontSize: { xs: '2rem', md: '3.1rem' }, lineHeight: .95 }}>BULLETIN</Typography><Typography variant="body2" sx={{ mt: 1, color: 'var(--bf-muted)', maxWidth: 620 }}>Verified student publications, clubs, faculty, and school offices. Every public story is attributable and reviewed.</Typography></Box>
      </Box>
      <Box sx={{ borderBottom: '1px solid var(--bf-divider)' }}>
        {posts.map((post) => <Box key={post.id} component="article" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '150px minmax(0,1fr) 220px' }, borderTop: '1px solid var(--bf-divider)' }}>
          <Box sx={{ p: { xs: 1.25, md: 1.75 }, borderRight: { md: '1px solid var(--bf-divider)' } }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{post.kind.replace(/_/g, ' ')}</Typography><Typography variant="caption" sx={{ display: 'block', mt: .5, color: 'var(--bf-muted)' }}>{displayDate(post.publishedAt)}</Typography></Box>
          <Box sx={{ p: { xs: 1.5, md: 2.25 }, minWidth: 0 }}><Link href={`/bulletin/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}><Typography component="h2" sx={{ fontWeight: 900, letterSpacing: '-.045em', fontSize: { xs: '1.25rem', md: '1.65rem' } }}>{post.headline}</Typography></Link><Typography variant="body2" sx={{ mt: .75, color: 'var(--bf-muted)' }}>{post.dek}</Typography>{post.correctionNote ? <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'var(--bf-interactive)' }}>CORRECTED / {post.correctionNote}</Typography> : null}</Box>
          <Box sx={{ p: { xs: 1.25, md: 1.75 }, borderLeft: { md: '1px solid var(--bf-divider)' }, borderTop: { xs: '1px solid var(--bf-divider)', md: 0 } }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>BY</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>{post.authorName}</Typography>{post.creatorType ? <Typography variant="caption" sx={{ display: 'block', color: 'var(--bf-muted)' }}>{post.creatorType.replace(/_/g, ' ')}</Typography> : null}{post.isSponsored ? <Typography variant="caption" sx={{ display: 'block', color: 'var(--bf-interactive)', mt: 1 }}>SPONSORED DISCLOSURE</Typography> : null}</Box>
        </Box>)}
        {posts.length === 0 ? <Box sx={{ py: 6 }}><Typography sx={{ fontWeight: 800 }}>No Bulletin stories have been published yet.</Typography><Typography variant="body2" sx={{ color: 'var(--bf-muted)', mt: .75 }}>Verified creator work will appear here after editorial review.</Typography></Box> : null}
      </Box>
    </Box>
  </ClientLayout></BasisProvider>;
}
