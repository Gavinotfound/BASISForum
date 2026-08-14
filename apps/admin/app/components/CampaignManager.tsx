'use client';

import React from 'react';
import { Box, Button, Checkbox, FormControlLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import type { ForumCampaignSettings } from '@basis-forum/database';
import { saveCampaignSettings } from '../actions/campaign';

export default function CampaignManager({ campaign, canManage }: { campaign: ForumCampaignSettings; canManage: boolean }) {
  const [state, formAction, isPending] = React.useActionState(saveCampaignSettings, {});

  if (!canManage) {
    return <Box sx={{ borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)', py: 2 }}><Typography variant="body2" sx={{ color: 'var(--bf-muted)' }}>Campaign settings are visible to the moderation team. An administrator can edit and publish this forum placement.</Typography></Box>;
  }

  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 0, bgcolor: 'transparent' }, '& .MuiInputLabel-root': { color: 'var(--bf-muted)' } };
  return <Box component="section" aria-labelledby="campaign-settings-title" sx={{ borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1fr) 260px' }, borderBottom: '1px solid var(--bf-divider)' }}>
      <Box sx={{ p: { xs: 1.75, md: 2.5 }, borderRight: { lg: '1px solid var(--bf-divider)' } }}><Typography id="campaign-settings-title" variant="h5" sx={{ fontWeight: 900 }}>Top forum campaign</Typography><Typography variant="body2" sx={{ mt: .75, color: 'var(--bf-muted)', maxWidth: '62ch' }}>Publish a community announcement or sponsor placement above the thread index. Changes are persistent and appear on the public homepage after saving.</Typography></Box>
      <Box sx={{ p: { xs: 1.75, md: 2.5 }, bgcolor: campaign.enabled ? 'transparent' : 'var(--bf-hover)' }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>CURRENT STATUS</Typography><Typography variant="h6" sx={{ mt: .5 }}>{campaign.enabled ? 'LIVE' : 'HIDDEN'}</Typography><Typography variant="caption" sx={{ display: 'block', mt: .75, color: 'var(--bf-muted)' }}>{campaign.template.toUpperCase()} / {campaign.kind.toUpperCase()}</Typography></Box>
    </Box>

    <Box component="form" action={formAction} sx={{ p: { xs: 1.75, md: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <FormControlLabel control={<Checkbox name="enabled" defaultChecked={campaign.enabled} />} label={<Typography variant="body2" sx={{ fontWeight: 800 }}>Show this campaign on the forum homepage</Typography>} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        <Box><Typography component="label" htmlFor="campaign-template" variant="overline" sx={{ color: 'var(--bf-muted)' }}>VISUAL TEMPLATE</Typography><Select id="campaign-template" name="template" defaultValue={campaign.template} fullWidth size="small" sx={{ mt: .5, minHeight: 44 }}><MenuItem value="cinematic">Cinematic monochrome / one accent</MenuItem><MenuItem value="swiss-grid">Swiss modular grid</MenuItem><MenuItem value="widescreen-photo">Widescreen photo</MenuItem></Select></Box>
        <Box><Typography component="label" htmlFor="campaign-kind" variant="overline" sx={{ color: 'var(--bf-muted)' }}>PLACEMENT TYPE</Typography><Select id="campaign-kind" name="kind" defaultValue={campaign.kind} fullWidth size="small" sx={{ mt: .5, minHeight: 44 }}><MenuItem value="community">Community announcement</MenuItem><MenuItem value="sponsor">Sponsored placement</MenuItem></Select></Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) minmax(220px,.45fr)' }, gap: 1.5 }}><TextField id="campaign-eyebrow" name="eyebrow" label="Eyebrow / 3–80 characters" defaultValue={campaign.eyebrow} required slotProps={{ htmlInput: { minLength: 3, maxLength: 80 } }} sx={fieldSx} /><TextField id="campaign-accent" name="accent" label="Accent hex color" defaultValue={campaign.accent || ''} placeholder="#812D37" slotProps={{ htmlInput: { pattern: '#[0-9A-Fa-f]{6}' } }} sx={fieldSx} /></Box>
      <TextField id="campaign-title" name="title" label="Campaign title / 6–120 characters" defaultValue={campaign.title} required slotProps={{ htmlInput: { minLength: 6, maxLength: 120 } }} sx={fieldSx} />
      <TextField id="campaign-body" name="body" label="Campaign copy / 12–320 characters" defaultValue={campaign.body} required multiline minRows={3} slotProps={{ htmlInput: { minLength: 12, maxLength: 320 } }} sx={fieldSx} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0,.55fr) minmax(0,1.45fr)' }, gap: 1.5 }}><TextField id="campaign-action" name="actionLabel" label="CTA label (optional)" defaultValue={campaign.actionLabel || ''} slotProps={{ htmlInput: { maxLength: 40 } }} sx={fieldSx} /><TextField id="campaign-href" name="href" label="Destination / path or HTTPS URL" defaultValue={campaign.href || ''} placeholder="/search or https://…" sx={fieldSx} /></Box>
      <TextField id="campaign-image" name="imageSrc" label="Widescreen image / site path or HTTPS URL" defaultValue={campaign.imageSrc || ''} placeholder="/images/campaign-independent-cinema.jpg" helperText="Used by the widescreen-photo template; leave blank to use a clean dark field." sx={fieldSx} />
      {state.error ? <Typography role="alert" variant="body2" sx={{ color: 'var(--bf-burgundy)' }}>{state.error}</Typography> : null}
      {state.success ? <Typography role="status" variant="body2" sx={{ color: 'var(--bf-interactive)' }}>{state.success}</Typography> : null}
      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', flexWrap: 'wrap' }}><Button type="submit" variant="contained" disabled={isPending}>{isPending ? 'SAVING CAMPAIGN' : 'SAVE CAMPAIGN'}</Button><Typography variant="caption" sx={{ color: 'var(--bf-muted)' }}>Only administrators can publish campaign changes.</Typography></Box>
    </Box>
  </Box>;
}
