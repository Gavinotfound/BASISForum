import type { CSSProperties } from 'react';
import { Box, Typography } from '@mui/material';
import type { ForumCampaignSlot } from '../config/campaign-slot';

const CampaignAction = ({ campaign, dark = false }: { campaign: ForumCampaignSlot; dark?: boolean }) => {
  if (!campaign.actionLabel || !campaign.href) return null;
  return <Box
    component="a"
    href={campaign.href}
    sx={{
      display: 'inline-flex', alignItems: 'center', minHeight: 40, px: 1.5,
      border: `1px solid ${dark ? '#FFFFFF' : 'var(--bf-text)'}`,
      color: dark ? '#FFFFFF' : 'var(--bf-text)', textDecoration: 'none',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '0.66rem', fontWeight: 700, letterSpacing: '.1em',
      '&:hover, &:focus-visible': { bgcolor: campaign.accent || 'var(--bf-interactive)', borderColor: campaign.accent || 'var(--bf-interactive)', color: '#FFFFFF' },
    }}
  >{campaign.actionLabel} ↗</Box>;
};

const CampaignMeta = ({ campaign, dark = false }: { campaign: ForumCampaignSlot; dark?: boolean }) => <Typography variant="overline" sx={{ color: dark ? 'rgba(255,255,255,.72)' : 'var(--bf-muted)' }}>
  {campaign.kind === 'sponsor' ? 'SPONSORED SPACE' : campaign.eyebrow}
</Typography>;

export default function CampaignSlot({ campaign }: { campaign: ForumCampaignSlot }) {
  if (!campaign.enabled) return null;

  const accent = campaign.accent || 'var(--bf-interactive)';
  const photographicBackground: CSSProperties = campaign.imageSrc ? { backgroundImage: `url(${campaign.imageSrc})` } : {};

  if (campaign.template === 'swiss-grid') {
    return <Box component="aside" aria-label={campaign.kind === 'sponsor' ? 'Sponsored message' : 'Community announcement'} sx={{ mb: { xs: 2, md: 3 }, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(120px,.55fr) minmax(0,1.65fr) minmax(150px,.7fr)' }, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-text)', bgcolor: 'var(--bf-surface)' }}>
      <Box sx={{ p: { xs: 1.5, md: 2 }, borderBottom: { xs: '1px solid var(--bf-divider)', sm: 'none' }, borderRight: { sm: '1px solid var(--bf-divider)' }, bgcolor: accent, color: '#FFFFFF' }}><Typography variant="overline">{campaign.kind === 'sponsor' ? 'PARTNER / 01' : 'PROGRAM / 01'}</Typography></Box>
      <Box sx={{ p: { xs: 2, md: 2.5 }, borderBottom: { xs: '1px solid var(--bf-divider)', sm: 'none' }, borderRight: { sm: '1px solid var(--bf-divider)' } }}><CampaignMeta campaign={campaign} /><Typography component="h2" sx={{ mt: .75, fontSize: { xs: '1.22rem', md: '1.52rem' }, fontWeight: 900, letterSpacing: '-.045em', lineHeight: 1.05, textTransform: 'uppercase' }}>{campaign.title}</Typography><Typography variant="body2" sx={{ mt: 1.2, maxWidth: '58ch', color: 'var(--bf-muted)' }}>{campaign.body}</Typography></Box>
      <Box sx={{ p: { xs: 1.5, md: 2 }, display: 'flex', alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'flex-start' }}><CampaignAction campaign={campaign} /></Box>
    </Box>;
  }

  if (campaign.template === 'widescreen-photo') {
    return <Box component="aside" aria-label={campaign.kind === 'sponsor' ? 'Sponsored message' : 'Community announcement'} sx={{ mb: { xs: 2, md: 3 }, minHeight: { xs: 300, md: 330 }, position: 'relative', overflow: 'hidden', borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-text)', backgroundColor: '#0A0A0A', backgroundSize: 'cover', backgroundPosition: 'center', ...photographicBackground }}>
      <Box sx={{ position: 'absolute', inset: 0, width: { xs: '100%', md: '55%' }, bgcolor: 'rgba(0,0,0,.88)', borderRight: { md: '1px solid rgba(255,255,255,.34)' } }} />
      <Box sx={{ position: 'relative', zIndex: 1, minHeight: 'inherit', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', p: { xs: 2, md: 3.25 }, color: '#FFFFFF', maxWidth: { xs: '100%', md: '55%' } }}><CampaignMeta campaign={campaign} dark /><Box sx={{ my: 2 }}><Typography component="h2" sx={{ fontSize: { xs: '1.5rem', md: '2.25rem' }, maxWidth: '16ch', fontWeight: 900, letterSpacing: '-.055em', lineHeight: .98, textTransform: 'uppercase' }}>{campaign.title}</Typography><Typography variant="body2" sx={{ mt: 1.25, maxWidth: '48ch', color: 'rgba(255,255,255,.8)' }}>{campaign.body}</Typography></Box><CampaignAction campaign={campaign} dark /></Box>
    </Box>;
  }

  return <Box component="aside" aria-label={campaign.kind === 'sponsor' ? 'Sponsored message' : 'Community announcement'} sx={{ mb: { xs: 2, md: 3 }, position: 'relative', overflow: 'hidden', minHeight: { xs: 240, md: 280 }, px: { xs: 2, md: 3.25 }, py: { xs: 2.25, md: 3 }, color: '#FFFFFF', bgcolor: '#080808', borderTop: '2px solid #FFFFFF', borderBottom: '1px solid #FFFFFF' }}>
    <Box sx={{ position: 'absolute', top: 0, right: 0, width: { xs: 70, md: 128 }, height: '100%', bgcolor: accent }} />
    <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: 'inherit', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: { xs: '100%', md: '75%' } }}><CampaignMeta campaign={campaign} dark /><Box sx={{ my: 2 }}><Typography component="h2" sx={{ maxWidth: '14ch', fontWeight: 950, fontSize: { xs: '1.65rem', sm: '2.15rem', md: '3rem' }, letterSpacing: '-.07em', lineHeight: .88, textTransform: 'uppercase' }}>{campaign.title}</Typography><Typography variant="body2" sx={{ mt: 1.35, maxWidth: '56ch', color: 'rgba(255,255,255,.78)' }}>{campaign.body}</Typography></Box><CampaignAction campaign={campaign} dark /></Box>
  </Box>;
}
