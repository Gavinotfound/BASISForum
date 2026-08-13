import { BasisProvider, DisplayModeSelector, LanguageSelector } from '@basis-forum/ui';
import { isLocale, translate } from '@basis-forum/ui/i18n';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GavelIcon from '@mui/icons-material/Gavel';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { getReports } from '@basis-forum/database';
import { isModerationRole } from '@basis-forum/core';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ReportQueue from './components/ReportQueue';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;
  const storedLocale = cookieStore.get('basis_locale')?.value;
  const locale = isLocale(storedLocale) ? storedLocale : 'en';
  const storedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = storedMode === 'light' || storedMode === 'low-contrast' || storedMode === 'amot' ? storedMode : 'dark';
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  if (!user || !isModerationRole(user.role)) redirect('http://49.233.13.58:3000/login');

  const reports = await getReports();
  const rows = reports.map((report) => ({ id: report.id, targetType: report.targetType, reason: report.reason, details: report.details, status: report.status, createdAt: report.createdAt, reporterId: report.reporterId, reporterName: report.reporter?.name || report.reporter?.username || 'Student', threadId: report.threadId || '', threadTitle: report.thread?.title || 'Removed discussion' }));
  const pendingCount = rows.filter((report) => report.status === 'pending').length;
  const resolvedCount = rows.filter((report) => report.status !== 'pending').length;
  const navigation = [
    { text: t('admin.overview'), icon: <DashboardIcon /> }, { text: t('admin.reports'), icon: <GavelIcon />, active: true },
    { text: t('admin.students'), icon: <PeopleIcon /> }, { text: t('admin.settings'), icon: <SettingsIcon /> },
  ];

  return <BasisProvider locale={locale} mode={mode}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '72px minmax(0,1fr)', md: '240px minmax(0,1fr)' }, minHeight: '100vh', bgcolor: 'var(--bf-bg)', color: 'var(--bf-text)' }}>
      <Box component="aside" sx={{ borderRight: '1px solid var(--bf-divider)', p: { xs: 1.25, md: 2.25 }, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ pb: 2.25, mb: 2.25, borderBottom: '1px solid var(--bf-divider)' }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.45rem' }, letterSpacing: '-.07em' }}>B</Typography>
          <Box sx={{ display: { xs: 'none', md: 'block' }, mt: .5 }}><Typography variant="h6" sx={{ letterSpacing: '-.05em' }}>BASISForum</Typography><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{t('admin.desk')}</Typography></Box>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mb: 2.5, gap: 1.5, flexWrap: 'wrap' }}><LanguageSelector /><DisplayModeSelector /></Box>
        <List sx={{ p: 0 }}>
          {navigation.map((item) => <ListItem key={item.text} sx={{ minHeight: 44, p: 0, pl: item.active ? 1 : 0, mb: 1, borderLeft: item.active ? '2px solid var(--bf-navy)' : '2px solid transparent', color: item.active ? 'var(--bf-text)' : 'var(--bf-muted)' }}><ListItemIcon sx={{ minWidth: { xs: 0, md: 32 }, color: 'inherit', justifyContent: 'center' }}>{item.icon}</ListItemIcon><ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.12em', display: { xs: 'none', md: 'block' } }} /></ListItem>)}
        </List>
        <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid var(--bf-divider)' }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)', display: { xs: 'none', md: 'block' } }}>{user.role}</Typography><Typography variant="body2" sx={{ fontWeight: 700, display: { xs: 'none', md: 'block' } }}>{user.name}</Typography></Box>
      </Box>

      <Box component="main" sx={{ p: { xs: 2, md: 5 }, maxWidth: 1600 }}>
        <Box sx={{ borderTop: '2px solid var(--bf-text)', pt: 2, mb: 6, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1.5fr) minmax(220px,.5fr)' }, gap: 3, alignItems: 'end' }}>
          <Box><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{t('admin.safety')} / INDEX 01</Typography><Typography variant="h2" sx={{ mt: 1, textTransform: 'uppercase', maxWidth: 820 }}>{t('admin.center')}</Typography><Typography variant="body2" sx={{ mt: 2, color: 'var(--bf-muted)', maxWidth: 520 }}>{t('admin.description')}</Typography></Box>
          <Box sx={{ borderTop: '1px solid var(--bf-divider)', pt: 1.25 }}><Typography variant="overline" sx={{ display: 'block', color: 'var(--bf-muted)' }}>01 / {t('admin.waiting')}</Typography><Typography variant="h4">{String(pendingCount).padStart(2, '0')}</Typography><Typography variant="overline" sx={{ display: 'block', mt: 1.5, color: 'var(--bf-muted)' }}>02 / {t('admin.resolved')}</Typography><Typography variant="h4">{String(resolvedCount).padStart(2, '0')}</Typography></Box>
        </Box>
        <ReportQueue reports={rows} labels={{ queueClear: t('admin.queueClear'), noReports: t('admin.noReports'), target: t('admin.target'), reporter: t('admin.reporter'), reason: t('admin.reason'), status: t('admin.status'), action: t('admin.action'), dismiss: t('admin.dismiss'), takeAction: t('admin.takeAction'), resolved: t('admin.resolvedLabel') }} />
      </Box>
    </Box>
  </BasisProvider>;
}
