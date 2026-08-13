'use client';

import React from 'react';
import { useActionState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, FormGroup, Paper, TextField, Typography } from '@mui/material';

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
      <Paper component="form" action={formAction} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>Your Study Profile</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Tell classmates what you are studying and build a recognizable learning identity.</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField label="Display name" name="name" required defaultValue={profile.name || ''} slotProps={{ htmlInput: { minLength: 2, maxLength: 60 } }} />
          <TextField label="Username" name="username" required defaultValue={profile.username || ''} slotProps={{ htmlInput: { minLength: 2, maxLength: 30 } }} />
          <TextField label="School" name="school" defaultValue={profile.school || ''} />
          <TextField label="Grade" name="grade" defaultValue={profile.grade || ''} placeholder="e.g. Grade 11" />
        </Box>
        <TextField label="About me" name="bio" defaultValue={profile.bio || ''} multiline rows={4} fullWidth sx={{ mt: 2 }} slotProps={{ htmlInput: { maxLength: 500 } }} placeholder="What classes, exams, or learning goals are you focused on?" />

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Favorite subjects</Typography>
        <FormGroup row>
          {subjects.map((subject) => (
            <FormControlLabel key={subject} control={<Checkbox name="subjects" value={subject} defaultChecked={selected.includes(subject)} />} label={subject} />
          ))}
        </FormGroup>

        {state.error ? <Alert severity="error" sx={{ mt: 2 }}>{state.error}</Alert> : null}
        {state.success ? <Alert severity="success" sx={{ mt: 2 }}>{state.success}</Alert> : null}
        <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={isPending}>{isPending ? 'Saving…' : 'Save profile'}</Button>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Learning Snapshot</Typography>
        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>{profile.reputationScore || 0}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>reputation points</Typography>
        <Typography variant="body2" sx={{ mb: 1.25 }}><strong>{profile.threadCount}</strong> discussions started</Typography>
        <Typography variant="body2" sx={{ mb: 1.25 }}><strong>{profile.bookmarkCount}</strong> saved discussions</Typography>
        <Typography variant="body2"><strong>{profile.unreadNotifications}</strong> unread notifications</Typography>
      </Paper>
    </Box>
  );
}
