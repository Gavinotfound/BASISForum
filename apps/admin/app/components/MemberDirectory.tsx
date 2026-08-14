'use client';

import React, { useState, useTransition } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { setMemberRoleAction } from '../actions/moderation';

type Member = {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  role: 'student' | 'moderator' | 'admin';
  reputationScore: number;
  createdAt: Date | null;
  threadCount: number;
  replyCount: number;
};

export default function MemberDirectory({ members, canManageRoles, currentUserId }: { members: Member[]; canManageRoles: boolean; currentUserId: string }) {
  const [roles, setRoles] = useState<Record<string, Member['role']>>(() => Object.fromEntries(members.map((member) => [member.id, member.role])));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const changeRole = (memberId: string, role: 'student' | 'moderator') => startTransition(async () => {
    setError(null);
    try {
      const result = await setMemberRoleAction(memberId, role);
      setRoles((current) => ({ ...current, [memberId]: result.role === 'moderator' ? 'moderator' : 'student' }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The member role could not be updated.');
    }
  });

  if (members.length === 0) return <Box sx={{ py: 4, borderTop: '1px solid var(--bf-divider)', borderBottom: '1px solid var(--bf-divider)' }}><Typography variant="body2" color="text.secondary">No members have joined yet.</Typography></Box>;

  return <Box sx={{ borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>
    {error ? <Typography role="alert" variant="body2" color="error" sx={{ py: 1.25 }}>{error}</Typography> : null}
    {members.map((member) => {
      const role = roles[member.id] || member.role;
      const isSelf = member.id === currentUserId;
      const displayName = member.name || member.username || 'Student';
      return <Box key={member.id} component="article" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', md: 'minmax(220px, 1.3fr) 100px 120px 120px 190px' }, gap: { xs: 1, md: 1.5 }, alignItems: 'center', py: { xs: 1.5, md: 1.25 }, borderBottom: '1px solid var(--bf-divider)' }}>
        <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>{displayName}</Typography><Typography variant="caption" sx={{ color: 'var(--bf-muted)', overflowWrap: 'anywhere' }}>{member.email}</Typography></Box>
        <Typography variant="overline" sx={{ color: role === 'moderator' || role === 'admin' ? 'var(--bf-text)' : 'var(--bf-muted)' }}>{role}</Typography>
        <Typography variant="overline" sx={{ display: { xs: 'none', md: 'block' }, color: 'var(--bf-muted)' }}>{member.threadCount} topics</Typography>
        <Typography variant="overline" sx={{ display: { xs: 'none', md: 'block' }, color: 'var(--bf-muted)' }}>{member.replyCount} replies</Typography>
        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'flex-start' }, gap: 0.75, flexWrap: 'wrap' }}>
          {canManageRoles && !isSelf && role !== 'admin' ? <Button size="small" variant={role === 'moderator' ? 'outlined' : 'contained'} disabled={isPending} onClick={() => changeRole(member.id, role === 'moderator' ? 'student' : 'moderator')}>{role === 'moderator' ? 'Remove mod' : 'Make mod'}</Button> : <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{isSelf ? 'Current user' : role === 'admin' ? 'Administrator' : 'Role managed by admin'}</Typography>}
        </Box>
      </Box>;
    })}
  </Box>;
}
