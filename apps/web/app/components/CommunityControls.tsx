'use client';

import React, { useState, useTransition } from 'react';
import { useActionState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';

const reasons = ['Spam or advertising', 'Harassment or bullying', 'Academic dishonesty', 'Harmful or unsafe content', 'Incorrect subject category', 'Other'];
type State = { error?: string; success?: string };

export function BookmarkButton({
  initialBookmarked,
  canBookmark,
  threadId,
}: {
  initialBookmarked: boolean;
  canBookmark: boolean;
  threadId: string;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    if (!canBookmark || isPending) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/bookmarks/${threadId}`, { method: 'POST' });
        const result = await response.json() as { bookmarked: boolean; error?: string };
        if (!response.ok || result.error) setMessage(result.error || 'Saving this discussion failed. Please try again.');
        else setBookmarked(result.bookmarked);
      } catch {
        setMessage('Saving this discussion failed. Please check your connection and try again.');
      }
    });
  };

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 0.5 }}>
      <Button type="button" variant={bookmarked ? 'contained' : 'outlined'} size="small" startIcon={bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />} disabled={!canBookmark || isPending} onClick={toggle}>
        {bookmarked ? 'Saved' : 'Save'}
      </Button>
      {message ? <span style={{ color: '#d32f2f', fontSize: 12 }}>{message}</span> : null}
    </Box>
  );
}

export function ReportButton({
  canReport,
  action,
  compact = false,
}: {
  canReport: boolean;
  action: (state: State, formData: FormData) => Promise<State>;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(action, {});
  const reported = Boolean(state.success);

  return (
    <>
      <Button type="button" size="small" color="inherit" startIcon={<FlagOutlinedIcon fontSize="small" />} onClick={() => setOpen(true)} disabled={!canReport || reported}>
        {reported ? 'Reported' : compact ? 'Report' : 'Report content'}
      </Button>
      <Dialog open={open && !reported} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" action={formAction}>
          <DialogTitle>Report content</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField select name="reason" label="Reason" required defaultValue="">
              <MenuItem value="" disabled>Select a reason</MenuItem>
              {reasons.map((reason) => <MenuItem key={reason} value={reason}>{reason}</MenuItem>)}
            </TextField>
            <TextField name="details" label="Optional details" multiline rows={4} slotProps={{ htmlInput: { maxLength: 1000 } }} placeholder="Add context that helps moderators review this report." />
            {state.error ? <Alert severity="error">{state.error}</Alert> : null}
            {state.success ? <Alert severity="success">{state.success}</Alert> : null}
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="error" disabled={isPending}>{isPending ? 'Submitting…' : 'Submit report'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
