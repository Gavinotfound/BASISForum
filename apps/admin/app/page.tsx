import { BasisProvider, DisplayModeSelector, LanguageSelector } from '@basis-forum/ui';
import { isDisplayMode } from '@basis-forum/ui/src/theme-config';
import { isLocale, translate } from '@basis-forum/ui/i18n';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GavelIcon from '@mui/icons-material/Gavel';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import ArticleIcon from '@mui/icons-material/Article';
import { getAdminDashboard, getCreatorVerificationQueue, getEditorialReviewQueue, getForumCampaignSettings, getKnowledgeCardReviewQueue, getMentorVerificationQueue, getReports, getStudyHubReviewQueue } from '@basis-forum/database';
import { isModerationRole } from '@basis-forum/core';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ReportQueue from './components/ReportQueue';
import ThreadOperations from './components/ThreadOperations';
import MemberDirectory from './components/MemberDirectory';
import CampaignManager from './components/CampaignManager';
import EditorialDesk from './components/EditorialDesk';
import AcademicReviewDesk from './components/AcademicReviewDesk';

export const dynamic = 'force-dynamic';

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

export default async function AdminDashboard() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const user = session?.user as { id?: string; name?: string; role?: string } | undefined;
  const storedLocale = cookieStore.get('basis_locale')?.value;
  const locale = isLocale(storedLocale) ? storedLocale : 'en';
  const storedMode = cookieStore.get('basis_display_mode')?.value;
  const mode = isDisplayMode(storedMode) ? storedMode : 'dark';
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  if (!user?.id || !isModerationRole(user.role)) redirect('http://49.233.13.58:3000/login');

  const [dashboard, reports, campaign, editorialPosts, creatorRequests, knowledgeCards, studyHubs, mentorRequests] = await Promise.all([getAdminDashboard(), getReports(), getForumCampaignSettings(), getEditorialReviewQueue(), getCreatorVerificationQueue(), getKnowledgeCardReviewQueue(), getStudyHubReviewQueue(), getMentorVerificationQueue()]);
  const rows = reports.map((report) => ({ id: report.id, targetType: report.targetType, reason: report.reason, details: report.details, status: report.status, createdAt: report.createdAt, reporterId: report.reporterId, reporterName: report.reporter?.name || report.reporter?.username || 'Student', threadId: report.threadId || '', threadTitle: report.thread?.title || 'Removed discussion' }));
  const pendingCount = dashboard.metrics.pendingReports;
  const resolvedCount = dashboard.metrics.resolvedReports7d;
  const canManageRoles = user.role === 'admin';
  const navigation = [
    { text: t('admin.overview'), icon: <DashboardIcon />, href: '#overview' },
    { text: t('admin.reports'), icon: <GavelIcon />, href: '#reports', badge: pendingCount },
    { text: t('admin.students'), icon: <PeopleIcon />, href: '#members' },
    { text: 'Editorial', icon: <ArticleIcon />, href: '#editorial', badge: editorialPosts.length + creatorRequests.length },
    { text: 'Academic', icon: <ArticleIcon />, href: '#academic-review', badge: knowledgeCards.length + studyHubs.length + mentorRequests.length },
    { text: 'Campaign', icon: <SettingsIcon />, href: '#campaign' },
    { text: t('admin.settings'), icon: <SettingsIcon />, href: '#operations' },
  ];
  const metricCards = [
    { label: 'Members', value: dashboard.metrics.totalMembers, delta: `+${dashboard.metrics.newMembers24h} / 24h` },
    { label: 'Topics', value: dashboard.metrics.totalThreads, delta: `+${dashboard.metrics.newThreads24h} / 24h` },
    { label: 'Replies', value: dashboard.metrics.totalReplies, delta: `+${dashboard.metrics.newReplies24h} / 24h` },
    { label: 'Votes', value: dashboard.metrics.totalVotes, delta: `+${dashboard.metrics.votes24h} / 24h` },
  ];

  return <BasisProvider locale={locale} mode={mode}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '64px minmax(0,1fr)', sm: '72px minmax(0,1fr)', md: '240px minmax(0,1fr)' }, minHeight: '100vh', bgcolor: 'var(--bf-bg)', color: 'var(--bf-text)' }}>
      <Box component="aside" sx={{ borderRight: '1px solid var(--bf-divider)', p: { xs: 0.75, sm: 1.25, md: 2.25 }, display: 'flex', flexDirection: 'column', position: { md: 'sticky' }, top: 0, height: { md: '100vh' } }}>
        <Box sx={{ pb: 2.25, mb: 2.25, borderBottom: '1px solid var(--bf-divider)' }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.45rem' }, letterSpacing: '-.07em' }}>B</Typography>
          <Box sx={{ display: { xs: 'none', md: 'block' }, mt: .5 }}><Typography variant="h6" sx={{ letterSpacing: '-.05em' }}>BASISForum</Typography><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{t('admin.desk')}</Typography></Box>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mb: 2.5, gap: 1.5, flexWrap: 'wrap' }}><LanguageSelector /><DisplayModeSelector /></Box>
        <List sx={{ p: 0 }}>
          {navigation.map((item, index) => <ListItem key={item.href} disablePadding sx={{ mb: 1 }}><ListItemButton component="a" href={item.href} aria-label={item.text} sx={{ minHeight: 44, p: 0, pl: index === 0 ? 1 : 0, borderLeft: index === 0 ? '2px solid var(--bf-interactive)' : '2px solid transparent', color: index === 0 ? 'var(--bf-text)' : 'var(--bf-muted)', '&:hover': { bgcolor: 'var(--bf-hover)', color: 'var(--bf-text)' } }}><ListItemIcon sx={{ minWidth: { xs: 0, md: 32 }, color: 'inherit', justifyContent: 'center' }}>{item.icon}</ListItemIcon><ListItemText primary={<Typography component="span" sx={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.12em', display: { xs: 'none', md: 'block' } }}>{item.text}{item.badge ? ` / ${item.badge}` : ''}</Typography>} /></ListItemButton></ListItem>)}
        </List>
        <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid var(--bf-divider)' }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)', display: { xs: 'none', md: 'block' } }}>{user.role}</Typography><Typography variant="body2" sx={{ fontWeight: 700, display: { xs: 'none', md: 'block' } }}>{user.name}</Typography></Box>
      </Box>

      <Box component="main" sx={{ p: { xs: 1.5, sm: 2, md: 5 }, maxWidth: 1800, minWidth: 0 }}>
        <Box id="overview" sx={{ scrollMarginTop: 24, borderTop: '2px solid var(--bf-text)', pt: 2, mb: { xs: 4, md: 6 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1.5fr) minmax(220px,.5fr)' }, gap: 3, alignItems: 'end' }}>
          <Box><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>{t('admin.safety')} / LIVE OPERATIONS</Typography><Typography variant="h2" sx={{ mt: 1, textTransform: 'uppercase', maxWidth: 820 }}>{t('admin.center')}</Typography><Typography variant="body2" sx={{ mt: 2, color: 'var(--bf-muted)', maxWidth: 620 }}>A live view of community growth, discussion activity, queue health, and member permissions.</Typography></Box>
          <Box sx={{ borderTop: '1px solid var(--bf-divider)', pt: 1.25 }}><Typography variant="overline" sx={{ display: 'block', color: 'var(--bf-muted)' }}>01 / {t('admin.waiting')}</Typography><Typography variant="h4">{String(pendingCount).padStart(2, '0')}</Typography><Typography variant="overline" sx={{ display: 'block', mt: 1.5, color: 'var(--bf-muted)' }}>02 / RESOLVED THIS WEEK</Typography><Typography variant="h4">{String(resolvedCount).padStart(2, '0')}</Typography></Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' }, borderTop: '1px solid var(--bf-divider)', borderLeft: { md: '1px solid var(--bf-divider)' }, mb: { xs: 4, md: 6 } }}>
          {metricCards.map((metric) => <Box key={metric.label} sx={{ minWidth: 0, p: { xs: 1.5, md: 2.25 }, borderRight: '1px solid var(--bf-divider)', borderBottom: '1px solid var(--bf-divider)' }}><Typography variant="overline" sx={{ display: 'block', color: 'var(--bf-muted)' }}>{metric.label}</Typography><Typography variant="h4" sx={{ mt: .25, fontVariantNumeric: 'tabular-nums' }}>{formatNumber(metric.value)}</Typography><Typography variant="caption" sx={{ color: 'var(--bf-muted)' }}>{metric.delta}</Typography></Box>)}
        </Box>

        <Box id="operations" sx={{ scrollMarginTop: 24, display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.35fr) minmax(320px, .65fr)' }, gap: { xs: 4, md: 6 }, mb: { xs: 5, md: 7 } }}>
          <Box><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>RECENT DISCUSSIONS / CONTENT CONTROL</Typography><Box sx={{ mt: 1.25, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>{dashboard.recentThreads.map((thread) => <Box key={thread.id} sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: '110px minmax(0, 1fr) auto' }, gap: 1.25, alignItems: 'center', py: 1.25, borderBottom: '1px solid var(--bf-divider)' }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)', display: { xs: 'none', md: 'block' } }}>{thread.subject}</Typography><Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{thread.title}</Typography><Typography variant="caption" sx={{ color: 'var(--bf-muted)' }}>{thread.author_name} · {thread.reply_count} replies</Typography></Box><ThreadOperations threadId={thread.id} initialPinned={thread.is_sticky} /></Box>)}{dashboard.recentThreads.length === 0 ? <Typography variant="body2" sx={{ py: 2, color: 'var(--bf-muted)' }}>No discussions have been posted yet.</Typography> : null}</Box></Box>
          <Box><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>SUBJECT ACTIVITY / TOPICS</Typography><Box sx={{ mt: 1.25, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}>{dashboard.subjectActivity.map((item) => <Box key={item.subject} sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2, py: 1.25, borderBottom: '1px solid var(--bf-divider)' }}><Typography variant="body2" sx={{ fontWeight: 800 }}>{item.subject}</Typography><Typography variant="overline" sx={{ color: 'var(--bf-muted)', fontVariantNumeric: 'tabular-nums' }}>{item.threads} topics</Typography></Box>)}{dashboard.subjectActivity.length === 0 ? <Typography variant="body2" sx={{ py: 2, color: 'var(--bf-muted)' }}>Activity will appear as members publish discussions.</Typography> : null}</Box><Typography variant="overline" sx={{ display: 'block', color: 'var(--bf-muted)', mt: 3 }}>TOP BY COMMUNITY HEAT</Typography><Box sx={{ mt: 1, borderTop: '1px solid var(--bf-divider)' }}>{dashboard.topDiscussions.slice(0, 4).map((thread) => <Box key={thread.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, py: 1, borderBottom: '1px solid var(--bf-divider)' }}><Typography variant="caption" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{thread.title}</Typography><Typography variant="overline" sx={{ flex: '0 0 auto', color: 'var(--bf-muted)' }}>{thread.vote_score > 0 ? '+' : ''}{thread.vote_score}</Typography></Box>)}</Box></Box>
        </Box>

        <Box id="reports" sx={{ scrollMarginTop: 24, mb: { xs: 5, md: 7 } }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>REPORT QUEUE / ACTIVE SAFETY WORK</Typography><Typography variant="h5" sx={{ mt: .5, mb: 1.5, fontWeight: 900 }}>Community reports</Typography><ReportQueue reports={rows} labels={{ queueClear: t('admin.queueClear'), noReports: t('admin.noReports'), target: t('admin.target'), reporter: t('admin.reporter'), reason: t('admin.reason'), status: t('admin.status'), action: t('admin.action'), dismiss: t('admin.dismiss'), takeAction: t('admin.takeAction'), resolved: t('admin.resolvedLabel') }} /></Box>

        <EditorialDesk posts={editorialPosts.map((post) => ({ id: post.id, headline: post.headline, dek: post.dek, kind: post.kind, author: { name: post.authorName, username: post.authorUsername }, createdAt: post.createdAt }))} creatorRequests={creatorRequests.map((profile) => ({ id: profile.id, displayName: profile.displayName, type: profile.type, statement: profile.statement, user: { name: profile.userName, username: profile.userUsername }, createdAt: profile.createdAt }))} canPublish={canManageRoles} />

        <AcademicReviewDesk cards={knowledgeCards} hubs={studyHubs} mentors={mentorRequests} canManage={canManageRoles} />

        <Box id="campaign" sx={{ scrollMarginTop: 24, mb: { xs: 5, md: 7 } }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>CAMPAIGN CONTROL / HOMEPAGE PLACEMENT</Typography><Typography variant="h5" sx={{ mt: .5, mb: 1.5, fontWeight: 900 }}>Forum campaign editor</Typography><CampaignManager campaign={campaign} canManage={canManageRoles} /></Box>

        <Box id="members" sx={{ scrollMarginTop: 24 }}><Typography variant="overline" sx={{ color: 'var(--bf-muted)' }}>MEMBER DIRECTORY / COMMUNITY ACCESS</Typography><Typography variant="h5" sx={{ mt: .5, mb: 1.5, fontWeight: 900 }}>Recent members and role management</Typography><MemberDirectory members={dashboard.members} canManageRoles={canManageRoles} currentUserId={user.id} /></Box>
      </Box>
    </Box>
  </BasisProvider>;
}
