import React from 'react';
import { BasisProvider } from '@basis-forum/ui';
import { isDisplayMode } from '@basis-forum/ui/src/theme-config';
import { getForumCampaignSettings, getHomepageFeaturedEditorialPost, getThreads, type ThreadSort } from '@basis-forum/database';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import ClientLayout from './components/ClientLayout';
import ClientPage from './components/ClientPage';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: requestedSort } = await searchParams;
  const sort: ThreadSort = requestedSort === 'hot' ? 'hot' : 'latest';
  const [session, threads, campaign, featuredBulletin, cookieStore] = await Promise.all([auth(), getThreads(sort), getForumCampaignSettings(), getHomepageFeaturedEditorialPost(), cookies()]);
  const savedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = isDisplayMode(savedMode) ? savedMode : 'dark';

  return (
    <BasisProvider mode={mode}>
      <ClientLayout user={session?.user}>
        <ClientPage user={session?.user} threads={threads} sort={sort} campaign={campaign} featuredBulletin={featuredBulletin ? { slug: featuredBulletin.slug, headline: featuredBulletin.headline, dek: featuredBulletin.dek, kind: featuredBulletin.kind, authorName: featuredBulletin.authorName, creatorType: featuredBulletin.creatorType, publishedAt: featuredBulletin.publishedAt?.toISOString(), correctionNote: featuredBulletin.correctionNote, isSponsored: featuredBulletin.isSponsored } : null} />
      </ClientLayout>
    </BasisProvider>
  );
}
