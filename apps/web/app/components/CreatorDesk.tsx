'use client';

import { useState, useTransition } from 'react';
import { Box, Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import { requestCreatorAccess, saveCreatorDraft, submitCreatorDraft } from '../actions/editorial';

type CreatorProfile = { id: string; type: string; status: string; displayName: string } | null;
type DeskPost = { id: string; headline: string; dek: string; body: string; kind: string; status: string; tags: unknown; sourceLinks: unknown; imageSrc: string | null; scheduledAt: Date | null; updatedAt: Date };

const inputSx = { '& .MuiInputBase-root': { borderRadius: 0, color: 'var(--bf-text)' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--bf-divider)' }, '& .MuiInputLabel-root': { color: 'var(--bf-muted)' } };

export default function CreatorDesk({ profile, posts }: { profile: CreatorProfile; posts: DeskPost[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [draft] = useState<DeskPost | null>(posts.find((post) => post.status === 'draft') || null);

  const run = (work: () => Promise<unknown>, success: string) => startTransition(async () => {
    try { await work(); setMessage(success); window.location.reload(); } catch (error) { setMessage(error instanceof Error ? error.message : 'The action could not be completed.'); }
  });

  if (!profile || profile.status !== 'verified') {
    return <Box component="section" sx={{ borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)', py: 2, maxWidth: 760 }}>
      <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>BASIS BULLETIN / CREATOR ACCESS</Typography>
      <Typography component="h1" variant="h4" sx={{ mt: .5, fontWeight: 900 }}>Request verified creator access</Typography>
      <Typography variant="body2" sx={{ color: 'var(--bf-muted)', mt: 1, maxWidth: 600 }}>Verified creators can draft news, announcements, and events. Every public story is reviewed before publication.</Typography>
      <Box component="form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); run(() => requestCreatorAccess({ type: String(form.get('type')), displayName: String(form.get('displayName')), statement: String(form.get('statement')) }), 'Creator request submitted for review.'); }} sx={{ mt: 2.5, display: 'grid', gap: 1.5, maxWidth: 620 }}>
        <TextField name="displayName" label="Publication, club, or creator name" required slotProps={{ htmlInput: { minLength: 2, maxLength: 80 } }} sx={inputSx} />
        <Select name="type" defaultValue="student_publication" aria-label="Creator type" sx={{ borderRadius: 0, color: 'var(--bf-text)', border: '1px solid var(--bf-divider)' }}><MenuItem value="student_publication">Student publication</MenuItem><MenuItem value="club">School club</MenuItem><MenuItem value="faculty_staff">Faculty or staff</MenuItem><MenuItem value="school_office">School office</MenuItem></Select>
        <TextField name="statement" label="What will you publish?" required multiline minRows={4} slotProps={{ htmlInput: { minLength: 30, maxLength: 800 } }} sx={inputSx} />
        <Button type="submit" variant="outlined" disabled={pending} sx={{ justifySelf: 'start' }}>REQUEST VERIFICATION</Button>
      </Box>
      {profile ? <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: profile.status === 'requested' ? 'var(--bf-interactive)' : 'var(--bf-muted)' }}>CURRENT STATUS / {profile.status.toUpperCase()}</Typography> : null}
      {message ? <Typography role="status" variant="body2" sx={{ mt: 1.5, color: 'var(--bf-interactive)' }}>{message}</Typography> : null}
    </Box>;
  }

  return <Box component="section" sx={{ maxWidth: 980 }}>
    <Box sx={{ borderTop: '2px solid var(--bf-text)', pt: 1.5, mb: 2.5, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}><Box><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>BASIS BULLETIN / CREATOR DESK</Typography><Typography component="h1" variant="h4" sx={{ fontWeight: 900 }}>{profile.displayName}</Typography></Box><Typography variant="overline">VERIFIED / {profile.type.replace(/_/g, ' ')}</Typography></Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1fr) 260px' }, gap: 3 }}>
      <Box component="form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); run(() => saveCreatorDraft({ postId: draft?.id, headline: String(form.get('headline')), dek: String(form.get('dek')), body: String(form.get('body')), kind: String(form.get('kind')), tags: String(form.get('tags') || ''), sources: String(form.get('sources') || ''), imageSrc: String(form.get('imageSrc') || ''), scheduledAt: String(form.get('scheduledAt') || ''), eventStartsAt: String(form.get('eventStartsAt') || ''), eventEndsAt: String(form.get('eventEndsAt') || ''), eventLocation: String(form.get('eventLocation') || ''), eventRegistrationUrl: String(form.get('eventRegistrationUrl') || ''), eventOrganizer: String(form.get('eventOrganizer') || '') }), 'Draft saved.'); }} sx={{ display: 'grid', gap: 1.5, borderBottom: '1px solid var(--bf-divider)', pb: 3 }}>
        <TextField name="headline" label="Headline" defaultValue={draft?.headline || ''} required slotProps={{ htmlInput: { minLength: 8, maxLength: 120 } }} sx={inputSx} />
        <TextField name="dek" label="Summary" defaultValue={draft?.dek || ''} required multiline minRows={2} slotProps={{ htmlInput: { minLength: 20, maxLength: 260 } }} sx={inputSx} />
        <Select name="kind" defaultValue={draft?.kind || 'news'} aria-label="Bulletin post type" sx={{ borderRadius: 0, color: 'var(--bf-text)', border: '1px solid var(--bf-divider)' }}><MenuItem value="news">News</MenuItem><MenuItem value="announcement">Announcement</MenuItem><MenuItem value="event">Event</MenuItem><MenuItem value="editorial_update">Editorial update</MenuItem></Select>
        <TextField name="body" label="Story" defaultValue={draft?.body || ''} required multiline minRows={12} slotProps={{ htmlInput: { minLength: 80 } }} sx={inputSx} />
        <TextField name="tags" label="Tags (comma-separated)" defaultValue={Array.isArray(draft?.tags) ? draft?.tags.join(', ') : ''} sx={inputSx} />
        <TextField name="sources" label="Source links (comma or line-separated HTTPS URLs)" defaultValue={Array.isArray(draft?.sourceLinks) ? draft?.sourceLinks.join('\n') : ''} multiline minRows={2} sx={inputSx} />
        <TextField name="imageSrc" label="Optional image path or HTTPS URL" defaultValue={draft?.imageSrc || ''} sx={inputSx} />
        <TextField name="scheduledAt" label="Optional publication time" type="datetime-local" slotProps={{ inputLabel: { shrink: true } }} sx={inputSx} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, p: 1.25, borderTop: '1px solid var(--bf-divider)', borderBottom: '1px solid var(--bf-divider)' }}><Typography variant="overline" sx={{ gridColumn: '1 / -1', color: 'var(--bf-muted)' }}>EVENT DETAILS / REQUIRED WHEN PUBLISHING AN EVENT</Typography><TextField name="eventStartsAt" label="Event starts" type="datetime-local" slotProps={{ inputLabel: { shrink: true } }} sx={inputSx} /><TextField name="eventEndsAt" label="Event ends" type="datetime-local" slotProps={{ inputLabel: { shrink: true } }} sx={inputSx} /><TextField name="eventLocation" label="Campus-safe location label" sx={inputSx} /><TextField name="eventOrganizer" label="Organizer label" sx={inputSx} /><TextField name="eventRegistrationUrl" label="Official registration URL" sx={{ ...inputSx, gridColumn: '1 / -1' }} /></Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}><Button type="submit" variant="outlined" disabled={pending}>SAVE DRAFT</Button>{draft ? <Button type="button" variant="contained" disabled={pending} onClick={() => run(() => submitCreatorDraft(draft.id), 'Submitted for editorial review.')}>SUBMIT FOR REVIEW</Button> : null}</Box>
      </Box>
      <Box sx={{ borderTop: '1px solid var(--bf-divider)' }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)', py: 1, display: 'block' }}>YOUR POST HISTORY</Typography>{posts.map((post) => <Box key={post.id} sx={{ py: 1.25, borderTop: '1px solid var(--bf-divider)' }}><Typography variant="body2" sx={{ fontWeight: 800 }}>{post.headline}</Typography><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{post.status.replace(/_/g, ' ')}</Typography></Box>)}{posts.length === 0 ? <Typography variant="body2" sx={{ color: 'var(--bf-muted)', py: 1 }}>Your saved drafts will appear here.</Typography> : null}</Box>
    </Box>
    {message ? <Typography role="status" variant="body2" sx={{ mt: 1.5, color: 'var(--bf-interactive)' }}>{message}</Typography> : null}
  </Box>;
}
