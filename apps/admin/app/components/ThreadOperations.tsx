'use client';

import React, { useState, useTransition } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { setThreadPinnedAction } from '../actions/moderation';

export default function ThreadOperations({ threadId, initialPinned }: { threadId: string; initialPinned: boolean }) {
  const [pinned, setPinned] = useState(initialPinned);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const togglePinned = () => startTransition(async () => {
    setError(null);
    try {
      const result = await setThreadPinnedAction(threadId, !pinned);
      setPinned(result.isSticky);
    } catch {
      setError('The discussion could not be updated.');
    }
  });

  return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
    <Button size="small" variant={pinned ? 'contained' : 'outlined'} disabled={isPending} onClick={togglePinned}>{pinned ? 'Pinned' : 'Pin topic'}</Button>
    {error ? <Typography role="alert" variant="caption" color="error">{error}</Typography> : null}
  </Box>;
}
