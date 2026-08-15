'use client';

import { useState, useTransition } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useLanguage } from '@basis-forum/ui';
import { useRouter } from 'next/navigation';
import { requestMentorHelp, requestMentorVerification } from '../actions/academic';

type Mentor = { id: string; subjects: unknown; statement: string; displayName: string };

const inputSx = {
  '& .MuiInputBase-root': { borderRadius: 0, color: 'var(--bf-text)' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--bf-divider)' },
  '& .MuiInputLabel-root': { color: 'var(--bf-muted)' },
};

const WorkflowFrame = ({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) => (
  <Box sx={{ maxWidth: 760, mx: 'auto', pt: { xs: 1.5, md: 2.5 } }}>
    <Box component="header" sx={{ borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)', py: { xs: 1.5, md: 2.25 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '150px minmax(0,1fr)' }, gap: { xs: .75, md: 2 } }}>
      <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{eyebrow}</Typography>
      <Box><Typography component="h1" sx={{ fontWeight: 900, letterSpacing: '-.06em', fontSize: { xs: '1.7rem', sm: '2.15rem', md: '2.65rem' }, lineHeight: .98 }}>{title}</Typography><Typography variant="body2" sx={{ mt: 1, color: 'var(--bf-muted)', lineHeight: 1.65 }}>{description}</Typography></Box>
    </Box>
    {children}
  </Box>
);

export function MentorHelpForm({ mentor }: { mentor: Mentor }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const subjectList = Array.isArray(mentor.subjects) ? mentor.subjects.join(' · ') : 'Academic support';

  return <WorkflowFrame eyebrow={t('study.mentors')} title={t('study.askQuestion')} description={`${mentor.displayName} · ${subjectList}`}>
    <Box component="form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); startTransition(async () => { try { await requestMentorHelp({ mentorProfileId: mentor.id, subject: String(form.get('subject')), question: String(form.get('question')) }); router.push('/study'); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : 'The request could not be submitted.'); } }); }} sx={{ mt: 3, display: 'grid', gap: 1.25 }}>
      <TextField name="subject" label={t('form.subject')} required sx={inputSx} />
      <TextField name="question" label={t('study.question')} multiline minRows={5} required sx={inputSx} />
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}><Button type="submit" variant="contained" disabled={pending}>{pending ? t('study.sending') : t('study.requestHelp')}</Button><Button type="button" variant="outlined" onClick={() => router.push('/study')}>{t('study.backToCenter')}</Button></Box>
      {message ? <Typography role="status" variant="body2" sx={{ color: 'var(--bf-interactive)' }}>{message}</Typography> : null}
    </Box>
  </WorkflowFrame>;
}

export function MentorVerificationForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  return <WorkflowFrame eyebrow={t('study.mentors')} title={t('study.becomeMentor')} description={t('study.verifyDescription')}>
    <Box component="form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); startTransition(async () => { try { await requestMentorVerification({ subjects: String(form.get('subjects')).split(',').map((subject) => subject.trim()).filter(Boolean), statement: String(form.get('statement')) }); router.push('/study'); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : 'The verification request could not be submitted.'); } }); }} sx={{ mt: 3, display: 'grid', gap: 1.25 }}>
      <TextField name="subjects" label={t('study.subjects')} required sx={inputSx} />
      <TextField name="statement" label={t('study.experience')} required multiline minRows={6} sx={inputSx} />
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}><Button type="submit" variant="contained" disabled={pending}>{pending ? t('study.sending') : t('study.requestVerificationButton')}</Button><Button type="button" variant="outlined" onClick={() => router.push('/study')}>{t('study.backToCenter')}</Button></Box>
      {message ? <Typography role="status" variant="body2" sx={{ color: 'var(--bf-interactive)' }}>{message}</Typography> : null}
    </Box>
  </WorkflowFrame>;
}
