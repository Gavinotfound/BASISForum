'use client';

import React from 'react';
import { useActionState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, FormGroup, TextField, Typography } from '@mui/material';

const subjects = ['Math', 'Science', 'History', 'English', 'Art', 'Computer Science', 'General'];

type State = { error?: string; success?: string };

type Profile = {
  name?: string | null;
  username?: string | null;
  bio?: string | null;
  school?: string | null;
  grade?: string | null;
  favoriteSubjects?: unknown;
  threadCount: number;
  bookmarkCount: number;
  unreadNotifications: number;
  reputationScore?: number | null;
};

export default function ProfileEditor({
  profile,
  action,
}: {
  profile: Profile;
  action: (state: State, formData: FormData) => Promise<State>;
}) {
  const [state, formAction, isPending] = useActionState(action, {});
  const selected = Array.isArray(profile.favoriteSubjects) ? profile.favoriteSubjects.map(String) : [];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 260px' }, gap: 3 }}>
      <Box component="form" action={formAction} aria-labelledby="profile-editor-title" sx={{ pt: 2, pb: 3, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>
        <Typography id="profile-editor-title" variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>Your Study Profile</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Tell classmates what you are studying and build a recognizable learning identity.</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField id="profile-name" label="Display name" name="name" required defaultValue={profile.name || ''} slotProps={{ htmlInput: { minLength: 2, maxLength: 60 } }} />
          <TextField id="profile-username" label="Username" name="username" required defaultValue={profile.username || ''} slotProps={{ htmlInput: { minLength: 2, maxLength: 30 } }} />
          <TextField id="profile-school" label="School" name="school" defaultValue={profile.school || ''} />
          <TextField id="profile-grade" label="Grade" name="grade" defaultValue={profile.grade || ''} placeholder="e.g. Grade 11" />
        </Box>
        <TextField id="profile-bio" label="About me" name="bio" defaultValue={profile.bio || ''} multiline rows={4} fullWidth sx={{ mt: 2 }} slotProps={{ htmlInput: { maxLength: 500 } }} placeholder="What classes, exams, or learning goals are you focused on?" />

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Favorite subjects</Typography>
        <FormGroup row>
          {subjects.map((subject) => (
            <FormControlLabel key={subject} control={<Checkbox name="subjects" value={subject} defaultChecked={selected.includes(subject)} />} label={subject} />
          ))}
        </FormGroup>

        {state.error ? <Alert severity="error" sx={{ mt: 2 }}>{state.error}</Alert> : null}
        {state.success ? <Alert severity="success" sx={{ mt: 2 }}>{state.success}</Alert> : null}
        <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={isPending}>{isPending ? 'Saving…' : 'Save profile'}</Button>
      </Box>

      <Box component="aside" aria-labelledby="learning-snapshot-title" sx={{ pt: 2, borderTop: '1px solid var(--bf-divider)', height: 'fit-content' }}>
        <Typography id="learning-snapshot-title" variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Learning Snapshot</Typography>
        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>{profile.reputationScore || 0}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>reputation points</Typography>
        <Typography variant="body2" sx={{ mb: 1.25 }}><strong>{profile.threadCount}</strong> discussions started</Typography>
        <Typography variant="body2" sx={{ mb: 1.25 }}><strong>{profile.bookmarkCount}</strong> saved discussions</Typography>
        <Typography variant="body2"><strong>{profile.unreadNotifications}</strong> unread notifications</Typography>
      </Box>
    </Box>
  );
}
