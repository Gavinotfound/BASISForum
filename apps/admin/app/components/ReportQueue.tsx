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

  if (reports.length === 0) return <Box sx={{ py: 8, borderTop: '1px solid #404040', borderBottom: '1px solid #404040' }}><Typography variant="h5">{labels.queueClear}</Typography><Typography variant="body2" sx={{ mt: 1, color: '#A3A3A3' }}>{labels.noReports}</Typography></Box>;

  return <TableContainer component={Box} sx={{ borderTop: '2px solid #FFFFFF', borderBottom: '1px solid #404040', overflowX: 'auto' }}>
    <Table sx={{ minWidth: 760 }}>
      <TableHead><TableRow>{[labels.target, labels.reporter, labels.reason, labels.status, labels.action].map((label) => <TableCell key={label} sx={{ py: 1.5, px: 1, borderBottom: '1px solid #FFFFFF', color: '#A3A3A3', fontWeight: 700, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' }}>{label}</TableCell>)}</TableRow></TableHead>
      <TableBody>{reports.map((report, index) => <TableRow key={report.id} sx={{ '& td': { borderBottom: '1px solid #262626' }, '&:hover': { bgcolor: '#080808' } }}>
        <TableCell sx={{ py: 2.5, px: 1 }}><Typography variant="overline" sx={{ color: '#A3A3A3' }}>{String(index + 1).padStart(2, '0')} / {report.targetType}</Typography><Typography variant="body2" sx={{ fontWeight: 700, maxWidth: 320 }}>{report.threadTitle}</Typography><Typography variant="caption" sx={{ color: '#A3A3A3' }}>{report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Just now'}</Typography></TableCell>
        <TableCell sx={{ px: 1, fontWeight: 700 }}>{report.reporterName}</TableCell>
        <TableCell sx={{ px: 1 }}><Typography variant="overline">{report.reason}</Typography>{report.details ? <Typography variant="caption" sx={{ display: 'block', mt: .6, color: '#A3A3A3', maxWidth: 220 }}>{report.details}</Typography> : null}</TableCell>
        <TableCell sx={{ px: 1 }}><Typography variant="overline" sx={{ color: report.status === 'pending' ? '#FFFFFF' : '#A3A3A3' }}>{report.status}</Typography></TableCell>
        <TableCell sx={{ px: 1 }}>{report.status === 'pending' ? <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}><Button size="small" variant="outlined" disabled={isPending} onClick={() => resolve(report, 'dismissed')}>{labels.dismiss}</Button><Button size="small" variant="contained" color="error" disabled={isPending} onClick={() => resolve(report, 'actioned')}>{labels.takeAction}</Button></Box> : <Typography variant="overline" sx={{ color: '#A3A3A3' }}>{labels.resolved}</Typography>}</TableCell>
      </TableRow>)}</TableBody>
    </Table>
  </TableContainer>;
}
