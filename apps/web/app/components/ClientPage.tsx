'use client';

import React, { useState } from 'react';
import { ThreadCard, useLanguage } from '@basis-forum/ui';
import { Typography, Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import CampaignSlot from './CampaignSlot';
import { forumCampaignSlot } from '../config/campaign-slot';

type ThreadListItem = { id: string; title: string; slug: string; subject: string; vote_score: number; reply_count: number; author_name?: string | null; updated_at?: string; is_sticky?: boolean };
type ForumUser = { id?: string; name?: string | null; email?: string | null; image?: string | null; role?: string };

export default function ClientPage({ user, threads, sort }: { user?: ForumUser; threads: ThreadListItem[]; sort: 'latest' | 'hot' }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const isHot = sort === 'hot';
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`); };

  const sortControls = <Box aria-label="Thread sorting" sx={{ display: 'flex', gap: 0.5, flex: '0 0 auto' }}><Button size="small" variant={!isHot ? 'text' : 'outlined'} onClick={() => router.push('/?sort=latest')}>{t('feed.latest')}</Button><Button size="small" variant={isHot ? 'text' : 'outlined'} onClick={() => router.push('/?sort=hot')}>{t('feed.hot')}</Button></Box>;

  return <Box sx={{ maxWidth: { lg: 1440, xl: 1680 }, mx: 'auto' }}>
    <CampaignSlot campaign={forumCampaignSlot} />
    <Box component="header" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '128px minmax(0,1fr) auto', md: '150px minmax(300px,1fr) auto' }, gap: { xs: 1.25, sm: 1.5, md: 2 }, alignItems: 'center', pt: { xs: 1.75, md: 2.5 }, pb: { xs: 1.25, md: 1.5 }, borderBottom: '2px solid var(--bf-text)' }}>
      <Box><Typography component="h1" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, fontWeight: 800, letterSpacing: '-.055em' }}>BASISFORUM</Typography><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>INDEX / 01</Typography></Box>
      <Box component="form" onSubmit={submitSearch} sx={{ minWidth: 0, borderBottom: '1px solid var(--bf-text)', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography component="label" htmlFor="forum-search" variant="overline" sx={{ color: 'var(--bf-muted)', whiteSpace: 'nowrap' }}>SEARCH</Typography>
        <input id="forum-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search threads" aria-label="Search threads" style={{ width: '100%', padding: '6px 0', minWidth: 0, border: 0, color: 'var(--bf-text)', background: 'transparent', font: 'inherit', outline: 'none' }} />
      </Box>
      {user ? <Button variant="outlined" size="small" sx={{ justifySelf: { xs: 'stretch', sm: 'auto' } }} onClick={() => router.push('/new-thread')}>{t('nav.newPost')}</Button> : <Button variant="outlined" size="small" sx={{ justifySelf: { xs: 'stretch', sm: 'auto' } }} onClick={() => router.push('/login')}>{t('nav.signIn')}</Button>}
    </Box>

    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'space-between', gap: 1, py: 0.75, borderBottom: '1px solid var(--bf-divider)', color: 'var(--bf-muted)' }}><Typography variant="overline">THREADS / {threads.length}</Typography>{sortControls}</Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '76px minmax(0,1fr) 44px', sm: '96px minmax(0,1fr) 58px', md: '120px minmax(0,1fr) 132px 88px 126px' }, gap: 0, borderBottom: '1px solid var(--bf-divider)', color: 'var(--bf-muted)' }}>
      <Typography variant="overline" sx={{ py: { xs: 0.8, md: 1 }, borderRight: { md: '1px solid var(--bf-divider)' }, px: { md: 1.25 } }}>CATEGORY</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, py: { xs: 0.8, md: 0.4 }, px: { md: 1.25 }, borderRight: { md: '1px solid var(--bf-divider)' } }}><Typography variant="overline">THREAD / {threads.length} TOTAL</Typography><Box sx={{ display: { xs: 'none', md: 'block' } }}>{sortControls}</Box></Box>
      <Typography variant="overline" sx={{ display: { xs: 'none', md: 'block' }, py: 1, borderRight: '1px solid var(--bf-divider)', px: 1.25 }}>AUTHOR</Typography>
      <Typography variant="overline" sx={{ py: { xs: 0.8, md: 1 }, borderRight: { md: '1px solid var(--bf-divider)' }, px: { md: 1.25 }, textAlign: 'right' }}>REPLIES</Typography>
      <Typography variant="overline" sx={{ display: { xs: 'none', md: 'block' }, py: 1, px: 1.25, textAlign: 'right' }}>LAST ACTIVE</Typography>
    </Box>

    {threads.length === 0 ? <Box sx={{ py: 6, borderBottom: '1px solid var(--bf-divider)' }}><Typography sx={{ fontWeight: 700 }}>{t('feed.emptyTitle')}</Typography><Typography variant="body2" sx={{ color: 'var(--bf-muted)', mt: .75 }}>{t('feed.emptyBody')}</Typography></Box> : threads.map((thread) => <ThreadCard key={thread.id} title={thread.title} author={thread.author_name || 'Student'} category={thread.subject} replies={thread.reply_count} score={thread.vote_score} updatedAt={thread.updated_at} isSticky={thread.is_sticky} onClick={() => router.push(`/threads/${thread.slug}`)} />)}
  </Box>;
}
