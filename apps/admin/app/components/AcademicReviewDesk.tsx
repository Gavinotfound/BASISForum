'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { createStudyHubAction, reviewKnowledgeCardAction, reviewMentorProfileAction, reviewStudyHubAction } from '../actions/academic';

type KnowledgeCard = { id: string; subject: string; title: string; summary: string; creatorName?: string | null; creatorUsername?: string | null };
type StudyHub = { id: string; subject: string; title: string; description: string; startsAt: Date; endsAt: Date; creatorName?: string | null; creatorUsername?: string | null };
type MentorRequest = { id: string; subjects: unknown; statement: string; userName?: string | null; userUsername?: string | null };

type QueueProps = { children: ReactNode; empty: string };
const Queue = ({ children, empty }: QueueProps) => <Box sx={{ borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>{children}{empty ? <Typography variant="body2" sx={{ py: 2, color: 'var(--bf-muted)' }}>{empty}</Typography> : null}</Box>;

export default function AcademicReviewDesk({ cards, hubs, mentors, canManage }: { cards: KnowledgeCard[]; hubs: StudyHub[]; mentors: MentorRequest[]; canManage: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const run = (work: () => Promise<unknown>, success: string) => startTransition(async () => {
    try {
      await work();
      setMessage(success);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The review action could not be completed.');
    }
  });

  return <Box id="academic-review" sx={{ scrollMarginTop: 24, mb: { xs: 5, md: 7 } }}>
    <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>ACADEMIC OPERATIONS / CURATION & VERIFICATION</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(3, minmax(0,1fr))' }, gap: { xs: 3, md: 4 }, mt: 1.25 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Knowledge cards</Typography>
        <Queue empty={cards.length ? '' : 'No knowledge cards are awaiting review.'}>
          {cards.map((card) => <Box key={card.id} sx={{ p: 1.5, borderBottom: '1px solid var(--bf-divider)' }}>
            <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{card.subject}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 900 }}>{card.title}</Typography>
            <Typography variant="caption" sx={{ color: 'var(--bf-muted)' }}>BY {card.creatorName || card.creatorUsername || 'Student'}</Typography>
            <Typography variant="body2" sx={{ mt: .75 }}>{card.summary}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
              <Button size="small" variant="contained" disabled={pending} onClick={() => run(() => reviewKnowledgeCardAction({ cardId: card.id, decision: 'publish' }), 'Knowledge card published.')}>PUBLISH</Button>
              <Button size="small" variant="outlined" disabled={pending} onClick={() => run(() => reviewKnowledgeCardAction({ cardId: card.id, decision: 'archive' }), 'Knowledge card archived.')}>ARCHIVE</Button>
            </Box>
          </Box>)}
        </Queue>
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Study hubs</Typography>
        <Queue empty={hubs.length ? '' : 'No study hubs are awaiting review.'}>
          {hubs.map((hub) => <Box key={hub.id} sx={{ p: 1.5, borderBottom: '1px solid var(--bf-divider)' }}>
            <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{hub.subject}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 900 }}>{hub.title}</Typography>
            <Typography variant="caption" sx={{ color: 'var(--bf-muted)' }}>BY {hub.creatorName || hub.creatorUsername || 'Student'}</Typography>
            <Typography variant="body2" sx={{ mt: .75 }}>{hub.description}</Typography>
            {canManage ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
              <Button size="small" variant="contained" disabled={pending} onClick={() => run(() => reviewStudyHubAction({ hubId: hub.id, decision: 'publish' }), 'Study hub published.')}>PUBLISH</Button>
              <Button size="small" variant="outlined" disabled={pending} onClick={() => run(() => reviewStudyHubAction({ hubId: hub.id, decision: 'archive' }), 'Study hub archived.')}>ARCHIVE</Button>
            </Box> : <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'var(--bf-muted)' }}>Admin publication approval required.</Typography>}
          </Box>)}
        </Queue>
        {canManage ? <Box component="form" onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          run(() => createStudyHubAction({ subject: String(form.get('subject')), title: String(form.get('title')), description: String(form.get('description')), startsAt: String(form.get('startsAt')), endsAt: String(form.get('endsAt')) }), 'Study hub drafted. Publish it from the queue.');
        }} sx={{ mt: 2, display: 'grid', gap: 1 }}>
          <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>CREATE STUDY HUB</Typography>
          <TextField size="small" name="subject" label="Subject" required />
          <TextField size="small" name="title" label="Title" required />
          <TextField size="small" name="startsAt" label="Starts" type="datetime-local" required slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" name="endsAt" label="Ends" type="datetime-local" required slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" name="description" label="Purpose" multiline minRows={3} required />
          <Button type="submit" size="small" variant="outlined" disabled={pending} sx={{ justifySelf: 'start' }}>CREATE HUB</Button>
        </Box> : null}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Mentor verification</Typography>
        <Queue empty={mentors.length ? '' : 'No mentor verification requests are awaiting review.'}>
          {mentors.map((mentor) => <Box key={mentor.id} sx={{ p: 1.5, borderBottom: '1px solid var(--bf-divider)' }}>
            <Typography variant="body1" sx={{ fontWeight: 900 }}>{mentor.userName || mentor.userUsername || 'Student'}</Typography>
            <Typography variant="caption" sx={{ color: 'var(--bf-muted)' }}>SUBJECTS / {Array.isArray(mentor.subjects) ? mentor.subjects.join(' · ') : 'Not specified'}</Typography>
            <Typography variant="body2" sx={{ mt: .75 }}>{mentor.statement}</Typography>
            {canManage ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
              <Button size="small" variant="contained" disabled={pending} onClick={() => run(() => reviewMentorProfileAction({ profileId: mentor.id, decision: 'verify' }), 'Mentor profile verified.')}>VERIFY</Button>
              <Button size="small" variant="outlined" disabled={pending} onClick={() => run(() => reviewMentorProfileAction({ profileId: mentor.id, decision: 'decline' }), 'Mentor request declined.')}>DECLINE</Button>
            </Box> : <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'var(--bf-muted)' }}>Admin verification required.</Typography>}
          </Box>)}
        </Queue>
      </Box>
    </Box>
    {message ? <Typography role="status" variant="body2" sx={{ mt: 1.5, color: 'var(--bf-interactive)' }}>{message}</Typography> : null}
  </Box>;
}
