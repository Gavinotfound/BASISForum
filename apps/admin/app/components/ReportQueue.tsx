'use client';

import React, { useTransition } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { reviewReport } from '../actions/moderation';

type ReportRow = { id: string; targetType: string; reason: string; details?: string | null; status: string; createdAt?: Date | null; reporterId: string; reporterName: string; threadId: string; threadTitle: string };
type Labels = { queueClear: string; noReports: string; target: string; reporter: string; reason: string; status: string; action: string; dismiss: string; takeAction: string; resolved: string };

export default function ReportQueue({ reports, labels }: { reports: ReportRow[]; labels: Labels }) {
  const [isPending, startTransition] = useTransition();
  const resolve = (report: ReportRow, status: 'dismissed' | 'actioned') => startTransition(async () => {
    await reviewReport(report.id, report.reporterId, report.threadId, status, status === 'actioned' ? 'Your report was actioned by the moderation team.' : 'Your report was reviewed and dismissed.');
  });
  const reportDate = (report: ReportRow) => report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Just now';
  const actionControls = (report: ReportRow) => report.status === 'pending' ? <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}><Button size="small" variant="outlined" disabled={isPending} onClick={() => resolve(report, 'dismissed')}>{labels.dismiss}</Button><Button size="small" variant="contained" color="error" disabled={isPending} onClick={() => resolve(report, 'actioned')}>{labels.takeAction}</Button></Box> : <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{labels.resolved}</Typography>;

  if (reports.length === 0) return <Box sx={{ py: { xs: 5, md: 8 }, borderTop: '1px solid var(--bf-divider)', borderBottom: '1px solid var(--bf-divider)' }}><Typography variant="h5">{labels.queueClear}</Typography><Typography variant="body2" sx={{ mt: 1, color: 'var(--bf-muted)' }}>{labels.noReports}</Typography></Box>;

  return <>
    <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>
      {reports.map((report, index) => <Box key={report.id} component="article" sx={{ py: 2, borderBottom: index === reports.length - 1 ? 'none' : '1px solid var(--bf-divider)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start', mb: 1 }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{String(index + 1).padStart(2, '0')} / {report.targetType}</Typography><Typography variant="overline" sx={{ color: report.status === 'pending' ? 'var(--bf-text)' : 'var(--bf-muted)', textAlign: 'right' }}>{report.status}</Typography></Box>
        <Typography variant="body2" sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>{report.threadTitle}</Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'var(--bf-muted)' }}>{reportDate(report)}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '78px minmax(0, 1fr)', rowGap: 0.75, columnGap: 1, mt: 1.5 }}>
          <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{labels.reporter}</Typography><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{report.reporterName}</Typography>
          <Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{labels.reason}</Typography><Box><Typography variant="overline">{report.reason}</Typography>{report.details ? <Typography variant="body2" sx={{ mt: 0.25, color: 'var(--bf-muted)', overflowWrap: 'anywhere' }}>{report.details}</Typography> : null}</Box>
        </Box>
        <Box sx={{ mt: 1.75 }}>{actionControls(report)}</Box>
      </Box>)}
    </Box>

    <TableContainer component={Box} sx={{ display: { xs: 'none', md: 'block' }, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)', overflowX: 'auto' }}>
      <Table sx={{ minWidth: 760 }}>
        <TableHead><TableRow>{[labels.target, labels.reporter, labels.reason, labels.status, labels.action].map((label) => <TableCell key={label} sx={{ py: 1.5, px: 1, borderBottom: '1px solid var(--bf-text)', color: 'var(--bf-muted)', fontWeight: 700, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' }}>{label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{reports.map((report, index) => <TableRow key={report.id} sx={{ '& td': { borderBottom: '1px solid var(--bf-divider)' }, '&:hover': { bgcolor: 'var(--bf-hover)' } }}>
          <TableCell sx={{ py: 2.5, px: 1 }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{String(index + 1).padStart(2, '0')} / {report.targetType}</Typography><Typography variant="body2" sx={{ fontWeight: 700, maxWidth: 320, overflowWrap: 'anywhere' }}>{report.threadTitle}</Typography><Typography variant="caption" sx={{ color: 'var(--bf-muted)' }}>{reportDate(report)}</Typography></TableCell>
          <TableCell sx={{ px: 1, fontWeight: 700 }}>{report.reporterName}</TableCell>
          <TableCell sx={{ px: 1 }}><Typography variant="overline">{report.reason}</Typography>{report.details ? <Typography variant="caption" sx={{ display: 'block', mt: 0.6, color: 'var(--bf-muted)', maxWidth: 220, overflowWrap: 'anywhere' }}>{report.details}</Typography> : null}</TableCell>
          <TableCell sx={{ px: 1 }}><Typography variant="overline" sx={{ color: report.status === 'pending' ? 'var(--bf-text)' : 'var(--bf-muted)' }}>{report.status}</Typography></TableCell>
          <TableCell sx={{ px: 1 }}>{actionControls(report)}</TableCell>
        </TableRow>)}</TableBody>
      </Table>
    </TableContainer>
  </>;
}
