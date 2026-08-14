'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { VoteTargetType } from '@basis-forum/database';

type VoteSummary = {
  likes: number;
  dislikes: number;
  score: number;
  currentUserVote: 1 | -1 | 0;
};

type VoteControlsProps = {
  targetType: VoteTargetType;
  targetId: string;
  initialVote: VoteSummary;
  canVote: boolean;
  action: (targetType: VoteTargetType, targetId: string, value: 1 | -1) => Promise<VoteSummary & { error?: string }>;
  compact?: boolean;
};

function RollingScore({ score, compact }: { score: number; compact: boolean }) {
  const [shownScore, setShownScore] = useState(score);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const previousScore = useRef(score);

  useEffect(() => {
    const start = previousScore.current;
    if (start === score) return;

    const change = score - start;
    const startedAt = performance.now();
    const duration = Math.min(520, 220 + Math.abs(change) * 90);
    setDirection(change >= 0 ? 'up' : 'down');

    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = start + Math.round(change * eased);
      setShownScore(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else previousScore.current = score;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const color = score === 0 ? 'var(--bf-muted)' : 'var(--bf-text)';
  const text = shownScore > 0 ? `+${shownScore}` : `${shownScore}`;

  return (
    <Box aria-live="polite" aria-label={`Score ${score}`} sx={{ minWidth: compact ? 31 : 38, height: compact ? 22 : 26, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
      <Typography
        key={`${shownScore}-${direction}`}
        variant={compact ? 'caption' : 'body2'}
        sx={{
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 950,
          letterSpacing: '-0.04em',
          color,
          animation: `${direction === 'up' ? 'scoreRollUp' : 'scoreRollDown'} 220ms cubic-bezier(.2,.85,.28,1)`,
          '@keyframes scoreRollUp': { from: { opacity: 0, transform: 'translateY(105%) scale(.85)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
          '@keyframes scoreRollDown': { from: { opacity: 0, transform: 'translateY(-105%) scale(.85)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

export default function VoteControls({
  targetType,
  targetId,
  initialVote,
  canVote,
  action,
  compact = false,
}: VoteControlsProps) {
  const [vote, setVote] = useState(initialVote);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitVote = (value: 1 | -1) => {
    if (!canVote || isPending) return;

    setError(null);
    startTransition(async () => {
      const result = await action(targetType, targetId, value);
      if (result.error) {
        setError(result.error);
        return;
      }
      setVote(result);
    });
  };

  const iconSize = compact ? 23 : 27;

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
      <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', py: 0.35, borderLeft: '1px solid var(--bf-divider)', borderRight: '1px solid var(--bf-divider)' }}>
        <IconButton
          size="small"
          type="button"
          onClick={() => submitVote(1)}
          disabled={!canVote || isPending}
          title={canVote ? 'Upvote' : 'Sign in to vote'}
          aria-label="Upvote"
          sx={{
            color: vote.currentUserVote === 1 ? 'var(--bf-bg)' : 'var(--bf-muted)',
            bgcolor: vote.currentUserVote === 1 ? 'var(--bf-text)' : 'transparent',
            transition: 'background-color 120ms linear',
            '&:hover': { color: 'var(--bf-selection-fg)', bgcolor: 'var(--bf-interactive-hover)' },
            '&:focus-visible': { outline: '1px solid var(--bf-interactive)', outlineOffset: 1 },
          }}
        >
          <ArrowUpwardIcon sx={{ fontSize: iconSize }} />
        </IconButton>
        <RollingScore score={vote.score} compact={compact} />
        <IconButton
          size="small"
          type="button"
          onClick={() => submitVote(-1)}
          disabled={!canVote || isPending}
          title={canVote ? 'Downvote' : 'Sign in to vote'}
          aria-label="Downvote"
          sx={{
            color: vote.currentUserVote === -1 ? '#FFFFFF' : 'var(--bf-muted)',
            bgcolor: vote.currentUserVote === -1 ? 'var(--bf-burgundy)' : 'transparent',
            transition: 'background-color 120ms linear',
            '&:hover': { color: '#FFFFFF', bgcolor: 'var(--bf-burgundy-hover)' },
            '&:focus-visible': { outline: '1px solid var(--bf-interactive)', outlineOffset: 1 },
          }}
        >
          <ArrowDownwardIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Box>
      {error ? <Typography role="alert" variant="caption" color="error">{error}</Typography> : null}
      {!canVote ? <Typography variant="caption" color="text.secondary">Sign in to vote</Typography> : null}
    </Box>
  );
}
