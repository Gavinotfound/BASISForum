'use client';

import Link from 'next/link';
import { Box, Typography } from '@mui/material';

type FeaturedBulletinPost = {
  slug: string;
  headline: string;
  dek: string;
  kind: string;
  authorName: string;
  creatorType?: string;
  publishedAt?: string;
  correctionNote?: string;
  isSponsored: boolean;
};

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : 'JUST PUBLISHED';

export default function FeaturedBulletin({ post }: { post?: FeaturedBulletinPost | null }) {
  if (!post) return null;
  return <Box component="article" aria-label="Featured from Bulletin" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '150px minmax(0, 1fr) minmax(180px, .42fr)' }, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)', mb: { xs: 1.75, md: 2.5 }, color: 'var(--bf-text)' }}>
    <Box sx={{ p: { xs: 1.25, md: 1.75 }, borderRight: { md: '1px solid var(--bf-divider)' }, borderBottom: { xs: '1px solid var(--bf-divider)', md: 0 } }}>
      <Typography variant="overline" sx={{ display: 'block', color: 'var(--bf-muted)' }}>FEATURED</Typography>
      <Typography variant="overline" sx={{ display: 'block', mt: .5 }}>{post.kind.replace(/_/g, ' ').toUpperCase()}</Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: .75, color: 'var(--bf-muted)' }}>{formatDate(post.publishedAt)}</Typography>
    </Box>
    <Box sx={{ p: { xs: 1.5, md: 2.25 }, minWidth: 0 }}>
      <Typography variant="overline" sx={{ display: 'block', color: 'var(--bf-muted)' }}>FROM BASIS BULLETIN / {post.isSponsored ? 'SPONSORED DISCLOSURE' : 'VERIFIED CREATOR'}</Typography>
      <Typography component="h2" sx={{ fontWeight: 900, letterSpacing: '-.055em', lineHeight: 1.04, fontSize: { xs: '1.3rem', md: '1.75rem' }, mt: .8 }}>{post.headline}</Typography>
      <Typography variant="body2" sx={{ mt: 1.1, color: 'var(--bf-muted)', maxWidth: 760 }}>{post.dek}</Typography>
      {post.correctionNote ? <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: 'var(--bf-interactive)' }}>CORRECTED / {post.correctionNote}</Typography> : null}
    </Box>
    <Box sx={{ p: { xs: 1.25, md: 1.75 }, borderLeft: { md: '1px solid var(--bf-divider)' }, borderTop: { xs: '1px solid var(--bf-divider)', md: 0 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
      <Box><Typography variant="overline" sx={{ display: 'block', color: 'var(--bf-muted)' }}>BY</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>{post.authorName}</Typography>{post.creatorType ? <Typography variant="caption" sx={{ display: 'block', color: 'var(--bf-muted)', mt: .25 }}>{post.creatorType.replace(/_/g, ' ')}</Typography> : null}</Box>
      <Link href={`/bulletin/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none', fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', borderBottom: '1px solid currentColor', paddingBottom: 6, alignSelf: 'flex-start' }}>Read the story</Link>
    </Box>
  </Box>;
}
