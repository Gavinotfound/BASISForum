export type CampaignTemplate = 'cinematic' | 'swiss-grid' | 'widescreen-photo';

export type ForumCampaignSlot = {
  enabled: boolean;
  template: CampaignTemplate;
  kind: 'community' | 'sponsor';
  eyebrow: string;
  title: string;
  body: string;
  actionLabel?: string;
  href?: string;
  accent?: string;
  imageSrc?: string;
};

/**
 * The only campaign-slot switch for the forum index. Future sponsor or community
 * campaigns can be scheduled by changing this data object; no feed layout code is
 * required. Set `enabled` to false to remove the slot completely.
 */
export const forumCampaignSlot: ForumCampaignSlot = {
  enabled: true,
  template: 'cinematic',
  kind: 'community',
  eyebrow: 'COMMUNITY PROGRAM / 2026',
  title: 'MAKE ROOM FOR THE NEXT IDEA.',
  body: 'A reserved top-of-forum space for student projects, campus initiatives, and future sponsor messages.',
  actionLabel: 'EXPLORE PROGRAM',
  href: '/search',
  accent: '#812D37',
  imageSrc: '/images/campaign-independent-cinema.jpg',
};

/**
 * Template guide:
 * - `cinematic`: monochrome composition with one configurable accent and oversized title.
 * - `swiss-grid`: editorial modular grid with structured campaign facts.
 * - `widescreen-photo`: photographic 21:9 treatment with restrained information overlay.
 */
