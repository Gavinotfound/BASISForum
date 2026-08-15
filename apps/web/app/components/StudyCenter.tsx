'use client';

import { useState, useTransition } from 'react';
import { Box, Button, Collapse, TextField, Typography } from '@mui/material';
import { useLanguage } from '@basis-forum/ui';
import { createCircle, joinStudyCircle, requestMentorHelp, requestMentorVerification, submitPeerFeedback } from '../actions/academic';
import { markNotificationsReadAction } from '../actions/community';

type Circle = {
  id: string;
  subject: string;
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  locationLabel: string | null;
  hostName: string;
  acceptedCount: number;
};
type Review = { id: string; threadTitle: string; threadSlug: string; rubric: unknown; requesterName: string; closesAt: Date | null };
type Mentor = { id: string; subjects: unknown; statement: string; displayName: string };
type Hub = { id: string; subject: string; title: string; description: string; startsAt: Date; endsAt: Date };
type Update = { id: string; message: string; readAt: Date | null; createdAt: Date | null; threadId: string | null; thread?: { slug?: string | null } | null };

const inputSx = {
  '& .MuiInputBase-root': { borderRadius: 0, color: 'var(--bf-text)' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--bf-divider)' },
  '& .MuiInputLabel-root': { color: 'var(--bf-muted)' },
};

export default function StudyCenter({
  hubs,
  circles,
  reviews,
  mentors,
  updates,
  signedIn,
}: {
  hubs: Hub[];
  circles: Circle[];
  reviews: Review[];
  mentors: Mentor[];
  updates: Update[];
  signedIn: boolean;
}) {
  const { locale, t } = useLanguage();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [openCircleForm, setOpenCircleForm] = useState(false);
  const [openReviewId, setOpenReviewId] = useState<string>();
  const [openMentorId, setOpenMentorId] = useState<string>();
  const [openMentorVerification, setOpenMentorVerification] = useState(false);
  const unreadCount = updates.filter((update) => !update.readAt).length;
  const formatDate = (date: Date) => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date));

  const run = (work: () => Promise<unknown>, success: string) => startTransition(async () => {
    try {
      await work();
      setMessage(success);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The action could not be completed.');
    }
  });
  const actionGuard = (work: () => Promise<unknown>, success: string) => signedIn
    ? run(work, success)
    : setMessage('Sign in to use this study feature.');

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
      <Box component="header" sx={{ borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)', py: { xs: 1.5, md: 2.25 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '160px minmax(0,1fr)' }, gap: { xs: .75, md: 2 } }}>
        <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>FINITE COLLABORATION</Typography>
        <Box>
          <Typography component="h1" sx={{ fontWeight: 900, letterSpacing: '-.07em', fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }, lineHeight: .98 }}>{t('study.title')}</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'var(--bf-muted)', maxWidth: 700, lineHeight: 1.65 }}>{t('study.description')}</Typography>
        </Box>
      </Box>

      <Box id="updates" component="section" sx={{ mt: { xs: 2.5, md: 4 }, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>
        <Box sx={{ px: { xs: 1.25, md: 2 }, py: 1.25, display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', borderBottom: '1px solid var(--bf-divider)' }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{t('study.updates')}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 900 }}>{t('study.unread', { count: unreadCount })}</Typography>
          </Box>
          {signedIn && unreadCount > 0 ? <Box component="form" action={markNotificationsReadAction}><Button type="submit" size="small" variant="outlined">{t('study.markRead')}</Button></Box> : null}
        </Box>
        {signedIn ? (
          <Box>
            {updates.map((update) => (
              <Box key={update.id} component="a" href={update.threadId && update.thread?.slug ? `/threads/${update.thread.slug}` : '/'} sx={{ display: 'block', px: { xs: 1.25, md: 2 }, py: 1.25, color: 'inherit', textDecoration: 'none', borderBottom: '1px solid var(--bf-divider)', bgcolor: update.readAt ? 'transparent' : 'var(--bf-hover)', '&:hover': { bgcolor: 'var(--bf-hover)' } }}>
                <Typography variant="body2" sx={{ fontWeight: update.readAt ? 600 : 900, overflowWrap: 'anywhere' }}>{update.message}</Typography>
                <Typography variant="caption" sx={{ color: 'var(--bf-muted)' }}>{update.createdAt ? new Date(update.createdAt).toLocaleString(locale) : 'Just now'}</Typography>
              </Box>
            ))}
            {updates.length === 0 ? <Typography variant="body2" sx={{ display: 'block', px: { xs: 1.25, md: 2 }, py: 2, color: 'var(--bf-muted)', lineHeight: 1.65 }}>{t('study.noUpdates')}</Typography> : null}
          </Box>
        ) : <Typography variant="body2" sx={{ display: 'block', px: { xs: 1.25, md: 2 }, py: 2, color: 'var(--bf-muted)' }}>{t('study.signInUpdates')}</Typography>}
      </Box>

      {hubs.length ? (
        <Box component="section" sx={{ mt: { xs: 2.5, md: 4 }, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>
          <Typography variant="overline" sx={{ display: 'block', p: 1.25, color: 'var(--bf-muted)' }}>ACTIVE STUDY HUBS / CURATED PROGRAMS</Typography>
          {hubs.map((hub) => (
            <Box key={hub.id} sx={{ p: { xs: 1.25, md: 2 }, borderTop: '1px solid var(--bf-divider)', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '120px minmax(0,1fr) auto' }, gap: 1.25, alignItems: 'baseline' }}>
              <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{hub.subject}</Typography>
              <Box><Typography variant="body1" sx={{ fontWeight: 900 }}>{hub.title}</Typography><Typography variant="body2" sx={{ mt: .5, color: 'var(--bf-muted)', lineHeight: 1.6 }}>{hub.description}</Typography></Box>
              <Typography variant="caption" sx={{ color: 'var(--bf-muted)' }}>{formatDate(hub.startsAt)} — {formatDate(hub.endsAt)}</Typography>
            </Box>
          ))}
        </Box>
      ) : null}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0,1fr) minmax(0,1fr)' }, gap: { xs: 3.5, md: 6 }, mt: { xs: 2.5, md: 4 } }}>
        <Box component="section">
          <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{t('study.circles')}</Typography>
          <Box sx={{ mt: 1, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>
            {circles.map((circle) => (
              <Box key={circle.id} sx={{ p: { xs: 1.25, md: 2 }, borderBottom: '1px solid var(--bf-divider)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}><Typography variant="body1" sx={{ fontWeight: 900, overflowWrap: 'anywhere' }}>{circle.title}</Typography><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{circle.subject}</Typography></Box>
                <Typography variant="body2" sx={{ mt: .75, color: 'var(--bf-muted)', lineHeight: 1.6 }}>{circle.description}</Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>HOST / {circle.hostName} · {formatDate(circle.startsAt)} · {circle.acceptedCount + 1}/{circle.capacity} students</Typography>
                {circle.locationLabel ? <Typography variant="caption" sx={{ display: 'block', color: 'var(--bf-muted)' }}>LOCATION / {circle.locationLabel}</Typography> : null}
                <Button size="small" variant="outlined" disabled={pending} sx={{ mt: 1.25 }} onClick={() => actionGuard(() => joinStudyCircle(circle.id), 'Request sent to the study-circle host.')}>REQUEST TO JOIN</Button>
              </Box>
            ))}
            {circles.length === 0 ? <Typography variant="body2" sx={{ py: 2, color: 'var(--bf-muted)' }}>{t('study.noCircles')}</Typography> : null}
          </Box>
          <Button size="small" variant="outlined" aria-expanded={openCircleForm} sx={{ mt: 2 }} onClick={() => setOpenCircleForm((open) => !open)}>{openCircleForm ? t('study.closeCircle') : t('study.openCircle')}</Button>
          <Collapse in={openCircleForm}>
            <Box component="form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); actionGuard(() => createCircle({ subject: String(form.get('subject')), title: String(form.get('title')), description: String(form.get('description')), startsAt: String(form.get('startsAt')), endsAt: String(form.get('endsAt')), capacity: Number(form.get('capacity')), locationLabel: String(form.get('location') || '') }), 'Study circle opened for requests.'); }} sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
              <Typography variant="overline" sx={{ gridColumn: '1 / -1', color: 'var(--bf-muted)' }}>{t('study.openCircleHeading')}</Typography>
              <TextField name="title" label={t('study.titleField')} required sx={{ ...inputSx, gridColumn: { xs: '1 / -1', sm: 'auto' } }} />
              <TextField name="subject" label={t('form.subject')} required sx={inputSx} />
              <TextField name="startsAt" label={t('study.starts')} type="datetime-local" required slotProps={{ inputLabel: { shrink: true } }} sx={inputSx} />
              <TextField name="endsAt" label={t('study.ends')} type="datetime-local" required slotProps={{ inputLabel: { shrink: true } }} sx={inputSx} />
              <TextField name="capacity" label={t('study.capacity')} type="number" defaultValue={4} required slotProps={{ htmlInput: { min: 2, max: 12 } }} sx={inputSx} />
              <TextField name="location" label={t('study.location')} sx={inputSx} />
              <TextField name="description" label={t('study.plan')} required multiline minRows={3} sx={{ ...inputSx, gridColumn: '1 / -1' }} />
              <Button type="submit" variant="contained" disabled={pending} sx={{ justifySelf: 'start' }}>{t('study.openCircle')}</Button>
            </Box>
          </Collapse>
        </Box>

        <Box component="section">
          <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{t('study.review')}</Typography>
          <Box sx={{ mt: 1, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>
            {reviews.map((review) => (
              <Box key={review.id} sx={{ p: { xs: 1.25, md: 2 }, borderBottom: '1px solid var(--bf-divider)' }}>
                <Typography variant="body1" sx={{ fontWeight: 900, overflowWrap: 'anywhere' }}>{review.threadTitle}</Typography>
                <Typography variant="caption" sx={{ color: 'var(--bf-muted)' }}>REQUESTED BY {review.requesterName}</Typography>
                <Typography variant="body2" sx={{ mt: .75, lineHeight: 1.6 }}>RUBRIC / {Array.isArray(review.rubric) ? review.rubric.join(' · ') : 'General feedback'}</Typography>
                <Button size="small" variant="outlined" aria-expanded={openReviewId === review.id} sx={{ mt: 1.25 }} onClick={() => setOpenReviewId((open) => open === review.id ? undefined : review.id)}>{openReviewId === review.id ? t('study.closeFeedback') : t('study.writeFeedback')}</Button>
                <Collapse in={openReviewId === review.id}>
                  <Box component="form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); actionGuard(() => submitPeerFeedback({ reviewId: review.id, criterion: String(form.get('criterion')), feedback: String(form.get('feedback')) }), 'Feedback submitted.'); }} sx={{ display: 'grid', gap: 1, mt: 1.25 }}>
                    <TextField name="criterion" label={t('study.criterion')} required sx={inputSx} />
                    <TextField name="feedback" label={t('study.feedback')} multiline minRows={3} required sx={inputSx} />
                    <Button type="submit" variant="outlined" disabled={pending} sx={{ justifySelf: 'start' }}>{t('study.submitFeedback')}</Button>
                  </Box>
                </Collapse>
              </Box>
            ))}
            {reviews.length === 0 ? <Typography variant="body2" sx={{ py: 2, color: 'var(--bf-muted)' }}>{t('study.noReviews')}</Typography> : null}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{t('study.mentors')}</Typography>
            <Box sx={{ mt: 1, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>
              {mentors.map((mentor) => (
                <Box key={mentor.id} sx={{ p: { xs: 1.25, md: 2 }, borderBottom: '1px solid var(--bf-divider)' }}>
                  <Typography variant="body1" sx={{ fontWeight: 900, overflowWrap: 'anywhere' }}>{mentor.displayName}</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--bf-muted)' }}>SUBJECTS / {Array.isArray(mentor.subjects) ? mentor.subjects.join(' · ') : 'Academic support'}</Typography>
                  <Typography variant="body2" sx={{ mt: .75, color: 'var(--bf-muted)', lineHeight: 1.6 }}>{mentor.statement}</Typography>
                  <Button size="small" variant="outlined" aria-expanded={openMentorId === mentor.id} sx={{ mt: 1.25 }} onClick={() => setOpenMentorId((open) => open === mentor.id ? undefined : mentor.id)}>{openMentorId === mentor.id ? t('study.closeRequest') : t('study.askQuestion')}</Button>
                  <Collapse in={openMentorId === mentor.id}>
                    <Box component="form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); actionGuard(() => requestMentorHelp({ mentorProfileId: mentor.id, subject: String(form.get('subject')), question: String(form.get('question')) }), 'Mentor request submitted.'); }} sx={{ display: 'grid', gap: 1, mt: 1.25 }}>
                      <TextField name="subject" label={t('form.subject')} required sx={inputSx} />
                      <TextField name="question" label={t('study.question')} multiline minRows={3} required sx={inputSx} />
                      <Button type="submit" variant="outlined" disabled={pending} sx={{ justifySelf: 'start' }}>{t('study.requestHelp')}</Button>
                    </Box>
                  </Collapse>
                </Box>
              ))}
              {mentors.length === 0 ? <Typography variant="body2" sx={{ py: 2, color: 'var(--bf-muted)' }}>{t('study.noMentors')}</Typography> : null}
            </Box>
            <Button size="small" variant="outlined" aria-expanded={openMentorVerification} sx={{ mt: 2 }} onClick={() => setOpenMentorVerification((open) => !open)}>{openMentorVerification ? t('study.closeVerification') : t('study.becomeMentor')}</Button>
            <Collapse in={openMentorVerification}>
              <Box component="form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); actionGuard(() => requestMentorVerification({ subjects: String(form.get('subjects')).split(',').map((subject) => subject.trim()).filter(Boolean), statement: String(form.get('statement')) }), 'Mentor verification request submitted for administrator review.'); }} sx={{ mt: 2, display: 'grid', gap: 1.25 }}>
                <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{t('study.requestVerification')}</Typography>
                <TextField name="subjects" label={t('study.subjects')} required sx={inputSx} />
                <TextField name="statement" label={t('study.experience')} required multiline minRows={4} sx={inputSx} />
                <Button type="submit" variant="contained" disabled={pending} sx={{ justifySelf: 'start' }}>{t('study.requestVerificationButton')}</Button>
              </Box>
            </Collapse>
          </Box>
        </Box>
      </Box>
      {message ? <Typography role="status" variant="body2" sx={{ mt: 2, color: 'var(--bf-interactive)' }}>{message}</Typography> : null}
    </Box>
  );
}
