'use client';

import React from 'react';
import {
  Box, AppBar, Toolbar, Typography, Container, Button, Card, CardContent,
  Chip, Grid, Avatar, CircularProgress, ButtonBase,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useLanguage } from '../LanguageProvider';

export type ForumUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

type NavbarProps = {
  user?: ForumUser;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onProfile?: () => void;
  onHome?: () => void;
  onBulletin?: () => void;
  onStudy?: () => void;
};

export const Navbar = ({ user, onSignIn, onProfile, onHome, onBulletin, onStudy }: NavbarProps) => {
  const { t } = useLanguage();
  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.default', backdropFilter: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth={false} sx={{ maxWidth: { lg: 1440, xl: 1680 }, px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: 'auto', sm: 60, md: 68 }, py: { xs: 0.75, sm: 0 }, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'auto minmax(0, 1fr)' }, gap: { xs: 0.75, sm: 2 }, alignItems: 'center' }}>
          <ButtonBase component="a" href="/" onClick={onHome} aria-label="Go to BasisForum home" sx={{ color: 'text.primary', justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap', textAlign: 'left', textDecoration: 'none', '&:hover': { opacity: .72 } }}>
            <Typography component="span" sx={{ color: 'text.primary', fontWeight: 900, fontSize: { xs: '1.1rem', sm: '1.25rem' }, letterSpacing: '-.07em' }}>B</Typography>
            <Typography variant="h6" component="span" sx={{ color: 'text.primary', fontWeight: 800, letterSpacing: '-.05em', fontSize: { xs: '1rem', sm: '1.1rem' } }}>BASISForum</Typography>
          </ButtonBase>
          <Box aria-label="Forum navigation" sx={{ minWidth: 0, width: { xs: '100%', sm: 'auto' }, display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: { xs: 0.35, sm: 0.75 }, alignItems: 'center', overflowX: 'auto', overscrollBehaviorX: 'contain', pb: { xs: 0.25, sm: 0 }, '&::-webkit-scrollbar': { display: 'none' } }}>
            <Button sx={{ color: 'text.primary', flex: '0 0 auto', px: { xs: 0.8, md: 1 }, minWidth: 0, minHeight: 44, whiteSpace: 'nowrap', fontSize: { xs: '.64rem', sm: '.72rem' } }} onClick={onBulletin}>{t('nav.bulletin')}</Button>
            <Button sx={{ color: 'text.primary', flex: '0 0 auto', px: { xs: 0.8, md: 1 }, minWidth: 0, minHeight: 44, whiteSpace: 'nowrap', fontSize: { xs: '.64rem', sm: '.72rem' } }} onClick={onStudy}>{t('nav.studyUpdates')}</Button>
            {user ? <ButtonBase aria-label={t('nav.profile')} onClick={onProfile} sx={{ width: 44, height: 44, flex: '0 0 auto', display: 'grid', placeItems: 'center', '&:hover .MuiAvatar-root': { opacity: .72 } }}><Avatar sx={{ width: 31, height: 31, bgcolor: 'text.primary', color: 'background.default', fontSize: 13, fontWeight: 900 }}>{(user.name || 'S').slice(0, 1).toUpperCase()}</Avatar></ButtonBase> : <Button variant="contained" color="secondary" sx={{ flex: '0 0 auto', minHeight: 44 }} onClick={onSignIn}>{t('nav.signIn')}</Button>}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export const LoadingScreen = ({ label }: { label?: string }) => {
  const { t } = useLanguage();
  return <Box sx={{ minHeight: '45vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.25, textAlign: 'center' }}>
    <Box sx={{ width: 64, height: 64, border: '1px solid #FFFFFF', display: 'grid', placeItems: 'center' }}><CircularProgress size={30} thickness={4.5} sx={{ color: 'white' }} /></Box>
    <Box><Typography variant="h6" sx={{ fontWeight: 800 }}>BASISForum</Typography><Typography variant="body2" color="text.secondary">{label || t('loading.default')}</Typography></Box>
  </Box>;
};

export const HeroBanner = ({ name, onNewThread }: { name: string; onNewThread?: () => void }) => {
  const { t } = useLanguage();
  return <Box sx={{ mb: { xs: 5, md: 8 }, minHeight: { xs: '72vw', md: 'min(67vw, 760px)' }, position: 'relative', overflow: 'hidden', color: '#FFFFFF', borderTop: '1px solid #FFFFFF', borderBottom: '1px solid #FFFFFF', backgroundColor: '#000000', backgroundImage: 'url(/images/study-poster-monochrome.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,.52)' }} />
    <Box sx={{ position: 'absolute', top: 0, right: 0, width: { xs: '22%', md: '31%' }, height: '100%', bgcolor: '#000000' }} />
    <Box sx={{ position: 'relative', zIndex: 1, height: '100%', minHeight: { xs: '72vw', md: 'min(67vw, 760px)' }, p: { xs: 2.25, md: 5 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.45fr) minmax(160px, .55fr)' }, alignItems: 'end', gap: { xs: 4, md: 2 } }}>
      <Box sx={{ maxWidth: 900 }}>
        <Typography variant="overline" sx={{ display: 'block', mb: 2, color: '#FFFFFF' }}>{t('hero.badge')} / ISSUE 01 / BASISFORUM</Typography>
        <Typography variant="h1" sx={{ maxWidth: '11ch', mb: 2.5, color: '#FFFFFF', textTransform: 'uppercase' }}>{t('hero.title', { name })}</Typography>
        <Typography variant="body1" sx={{ maxWidth: 440, color: '#FFFFFF', fontSize: { xs: '.92rem', md: '1.08rem' }, lineHeight: 1.5 }}>{t('hero.body')}</Typography>
      </Box>
      <Box sx={{ alignSelf: { xs: 'start', md: 'end' }, justifySelf: { xs: 'start', md: 'end' }, width: '100%', maxWidth: 240, borderTop: '1px solid #FFFFFF', pt: 1.25 }}>
        <Typography variant="overline" sx={{ display: 'block', mb: 1.5, color: '#FFFFFF' }}>DIRECTED BY / STUDENTS</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} size="large" onClick={onNewThread} sx={{ width: '100%' }}>{t('hero.cta')}</Button>
      </Box>
    </Box>
  </Box>;
};

export const CategoryBadge = ({ label }: { label: string }) => <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: .75, minWidth: 0 }}><Box aria-hidden sx={{ width: 7, height: 7, flex: '0 0 auto', bgcolor: 'var(--bf-interactive)' }} /><Typography variant="overline" sx={{ color: 'var(--bf-muted)', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</Typography></Box>;

export const ThreadCard = ({ title, author, category, replies, score = 0, updatedAt, isSticky = false, onClick }: { title: string; author: string; category: string; replies: number; score?: number; updatedAt?: string; isSticky?: boolean; onClick?: () => void }) => {
  const emphasized = isSticky || score >= 5;
  const activity = updatedAt ? new Intl.DateTimeFormat(undefined, { month: 'short', day: '2-digit' }).format(new Date(updatedAt)) : '—';
  return <Box component="article" onClick={onClick} sx={{ cursor: 'pointer', minHeight: { xs: 52, md: 48 }, display: 'grid', gridTemplateColumns: { xs: '76px minmax(0,1fr) 44px', sm: '96px minmax(0,1fr) 58px', md: '120px minmax(0,1fr) 132px 88px 126px' }, gap: 0, alignItems: 'stretch', borderBottom: '1px solid var(--bf-divider)', transition: 'background-color 120ms linear', '&:hover': { bgcolor: 'var(--bf-hover)' }, '& > *': { minWidth: 0, px: { xs: 0, md: 1.25 }, py: { xs: 1.1, md: 1.15 } }, '& > * + *': { borderLeft: { md: '1px solid var(--bf-divider)' } } }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}><CategoryBadge label={category} /></Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: .75, overflow: 'hidden' }}><Typography component="h2" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: emphasized ? { xs: '.88rem', sm: '.92rem', md: '1.02rem' } : { xs: '.78rem', sm: '.84rem', md: '.9rem' }, fontWeight: emphasized ? 800 : 600, letterSpacing: '-.015em' }}>{title}</Typography>{emphasized ? <Typography variant="overline" sx={{ color: 'inherit', flex: '0 0 auto' }}>HOT</Typography> : null}</Box>
    <Typography variant="overline" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', color: 'var(--bf-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{author.toUpperCase()}</Typography>
    <Typography variant="overline" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontVariantNumeric: 'tabular-nums', fontWeight: 800, color: score < 0 ? 'var(--bf-burgundy)' : 'var(--bf-muted)' }}>{replies}</Typography>
    <Typography variant="overline" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'flex-end', fontVariantNumeric: 'tabular-nums', color: 'var(--bf-muted)' }}>{activity}</Typography>
  </Box>;
};

export const CommunityStats = () => {
  const { t } = useLanguage();
  return <Box sx={{ py: 2.25, borderTop: '1px solid #FFFFFF', borderBottom: '1px solid #404040' }}>
    <Typography variant="overline" sx={{ color: '#A3A3A3' }}>{t('stats.eyebrow')}</Typography>
    <Typography variant="h4" sx={{ mt: 1, mb: 4, color: '#FFFFFF', whiteSpace: 'pre-line' }}>{t('stats.title')}</Typography>
    <Box sx={{ display: 'grid', gap: 2 }}><Typography variant="body2"><strong>01 / 1,240</strong> — {t('stats.students')}</Typography><Typography variant="body2"><strong>02 / 8,450</strong> — {t('stats.notes')}</Typography><Typography variant="body2"><strong>03 / 12</strong> — {t('stats.groups')}</Typography></Box>
  </Box>;
};

type LoginFormState = { error?: string };
export const LoginForm = ({ action }: { action: (previousState: LoginFormState, formData: FormData) => Promise<LoginFormState> }) => {
  const { t } = useLanguage();
  const [state, formAction, isPending] = React.useActionState(action, {});
  return <Box component="section" aria-labelledby="login-title" sx={{ maxWidth: 440, mx: 'auto', mt: { xs: 5, md: 8 }, pt: 2, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}><Typography id="login-title" variant="h5" sx={{ mb: 0.75, fontWeight: 800 }}>{t('auth.welcome')}</Typography><Typography variant="overline" sx={{ display: 'block', mb: 3, color: 'var(--bf-muted)' }}>{t('auth.loginKicker')}</Typography><Box component="form" action={formAction} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pb: 2.5 }}><Typography component="label" htmlFor="login-email" variant="body2" color="text.secondary">{t('auth.emailOrUsername')}</Typography><input id="login-email" name="email" type="text" required autoComplete="username" placeholder={t('auth.emailPlaceholder')} style={{ padding: '12px', borderRadius: 0 }} /><Typography component="label" htmlFor="login-password" variant="body2" color="text.secondary" sx={{ mt: 1 }}>{t('auth.password')}</Typography><input id="login-password" name="password" type="password" required autoComplete="current-password" style={{ padding: '12px', borderRadius: 0 }} />{state.error ? <Typography role="alert" variant="body2" color="error" sx={{ mt: 0.5 }}>{state.error}</Typography> : null}<Button type="submit" variant="contained" color="primary" size="large" disabled={isPending} sx={{ mt: 1 }}>{isPending ? t('auth.signingIn') : t('nav.signIn')}</Button><Button component="a" href="/register" color="inherit" size="small" sx={{ alignSelf: 'flex-start', px: 0 }}>{t('auth.createPrompt')}</Button></Box></Box>;
};

type RegisterFormState = { error?: string };
export const RegisterForm = ({ action }: { action: (previousState: RegisterFormState, formData: FormData) => Promise<RegisterFormState> }) => {
  const { t } = useLanguage();
  const [state, formAction, isPending] = React.useActionState(action, {});
  return <Box component="section" aria-labelledby="register-title" sx={{ maxWidth: 440, mx: 'auto', mt: { xs: 5, md: 8 }, pt: 2, borderTop: '2px solid var(--bf-text)', borderBottom: '1px solid var(--bf-divider)' }}><Typography id="register-title" variant="h5" sx={{ mb: 0.75, fontWeight: 800 }}>{t('auth.join')}</Typography><Typography variant="overline" sx={{ display: 'block', mb: 3, color: 'var(--bf-muted)' }}>{t('auth.registerKicker')}</Typography><Box component="form" action={formAction} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pb: 2.5 }}><Typography component="label" htmlFor="register-name" variant="body2" color="text.secondary">{t('auth.fullName')}</Typography><input id="register-name" name="name" type="text" required minLength={2} maxLength={60} autoComplete="name" style={{ padding: '12px', borderRadius: 0 }} /><Typography component="label" htmlFor="register-email" variant="body2" color="text.secondary" sx={{ mt: 1 }}>{t('auth.email')}</Typography><input id="register-email" name="email" type="email" required autoComplete="email" style={{ padding: '12px', borderRadius: 0 }} /><Typography component="label" htmlFor="register-password" variant="body2" color="text.secondary" sx={{ mt: 1 }}>{t('auth.password')}</Typography><input id="register-password" name="password" type="password" required minLength={8} autoComplete="new-password" style={{ padding: '12px', borderRadius: 0 }} />{state.error ? <Typography role="alert" variant="body2" color="error">{state.error}</Typography> : null}<Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 1 }} disabled={isPending}>{isPending ? t('auth.creating') : t('auth.create')}</Button><Button component="a" href="/login" color="inherit" size="small" sx={{ alignSelf: 'flex-start', px: 0 }}>{t('auth.signInPrompt')}</Button></Box></Box>;
};

type ThreadFormState = { error?: string };
export const ThreadForm = ({ action, subjects }: { action: (previousState: ThreadFormState, formData: FormData) => Promise<ThreadFormState>; subjects: string[] }) => {
  const { t } = useLanguage();
  const [state, formAction, isPending] = React.useActionState(action, {});
  return <Card sx={{ p: { xs: 2.5, md: 4 }, maxWidth: 860, mx: 'auto' }}><Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>{t('form.newDiscussion')}</Typography><Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{t('form.newDiscussionBody')}</Typography><Box component="form" action={formAction} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}><Box><Typography component="label" htmlFor="thread-kind" variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>POST TYPE</Typography><select id="thread-kind" name="kind" defaultValue="discussion" style={{ width: '100%', padding: '12px', borderRadius: 0, font: 'inherit' }}><option value="discussion">Discussion</option><option value="help_request">Academic help request</option><option value="review_request">Peer review request</option></select><Typography variant="caption" color="text.secondary">Help requests ask what you have already tried, so peers can answer usefully.</Typography></Box><Box><Typography component="label" htmlFor="thread-subject" variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>{t('form.subject')}</Typography><select id="thread-subject" name="subject" required defaultValue="General" style={{ width: '100%', padding: '12px', borderRadius: 0, font: 'inherit' }}>{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select></Box><Box><Typography component="label" htmlFor="thread-title" variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>{t('form.title')}</Typography><input id="thread-title" name="title" type="text" required minLength={4} maxLength={120} placeholder={t('form.titlePlaceholder')} style={{ width: '100%', padding: '12px', borderRadius: 0, font: 'inherit', boxSizing: 'border-box' }} /><Typography variant="caption" color="text.secondary">{t('form.titleHelp')}</Typography></Box><Box><Typography component="label" htmlFor="thread-content" variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>{t('form.details')}</Typography><textarea id="thread-content" name="content" required minLength={12} maxLength={8000} rows={9} placeholder={t('form.detailsPlaceholder')} style={{ width: '100%', padding: '12px', borderRadius: 0, fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1.5, resize: 'vertical', boxSizing: 'border-box' }} /><Typography variant="caption" color="text.secondary">{t('form.detailsHelp')}</Typography></Box><Box sx={{ p: 1.5, borderTop: '1px solid var(--bf-divider)', borderBottom: '1px solid var(--bf-divider)' }}><Typography variant="overline" sx={{ display: 'block', color: 'var(--bf-muted)', mb: 1 }}>ACADEMIC HELP CONTEXT / OPTIONAL FOR OTHER POST TYPES</Typography><Typography component="label" htmlFor="thread-assignment" variant="body2" color="text.secondary">Question, text, or assignment</Typography><input id="thread-assignment" name="assignment" type="text" maxLength={180} style={{ width: '100%', padding: '10px', borderRadius: 0, font: 'inherit', boxSizing: 'border-box', marginTop: 6 }} /><Typography component="label" htmlFor="thread-tried" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>What have you tried?</Typography><textarea id="thread-tried" name="whatTried" maxLength={500} rows={3} style={{ width: '100%', padding: '10px', borderRadius: 0, font: 'inherit', boxSizing: 'border-box', marginTop: 6 }} /><Typography component="label" htmlFor="thread-due" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>Optional due window</Typography><input id="thread-due" name="dueWindow" type="text" maxLength={80} placeholder="e.g. Friday afternoon" style={{ width: '100%', padding: '10px', borderRadius: 0, font: 'inherit', boxSizing: 'border-box', marginTop: 6 }} /><Typography component="label" htmlFor="peer-review-rubric" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>Peer-review criteria (for review requests)</Typography><input id="peer-review-rubric" name="peerReviewRubric" type="text" maxLength={400} placeholder="e.g. Thesis, evidence, structure" style={{ width: '100%', padding: '10px', borderRadius: 0, font: 'inherit', boxSizing: 'border-box', marginTop: 6 }} /><Typography component="label" htmlFor="peer-review-link" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>Optional read-only work link</Typography><input id="peer-review-link" name="peerReviewUrl" type="url" maxLength={500} placeholder="https://…" style={{ width: '100%', padding: '10px', borderRadius: 0, font: 'inherit', boxSizing: 'border-box', marginTop: 6 }} /></Box>{state.error ? <Typography role="alert" variant="body2" color="error">{state.error}</Typography> : null}<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}><Button type="submit" variant="contained" color="primary" size="large" disabled={isPending}>{isPending ? t('form.publishing') : t('form.publish')}</Button><Typography variant="caption" color="text.secondary">{t('form.visibility')}</Typography></Box></Box></Card>;
};

export const CommentForm = ({ action, placeholder = 'Add a reply...' }: { action: (formData: FormData) => void | Promise<void>; placeholder?: string }) => {
  const { t } = useLanguage();
  return <Box component="form" action={action} sx={{ mt: 3 }}><textarea name="content" required rows={3} aria-label={placeholder} placeholder={placeholder} style={{ width: '100%', padding: '12px', borderRadius: 0, fontFamily: 'inherit', marginBottom: '8px' }} /><Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><Button type="submit" variant="contained" color="primary">{t('form.reply')}</Button></Box></Box>;
};

export const CommentItem = ({ author, content, createdAt }: { author: string; content: string; createdAt: string }) => <Box sx={{ py: 2, borderBottom: '1px solid #404040' }}><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{author}</Typography><Typography variant="caption" color="text.secondary">{new Date(createdAt).toLocaleString()}</Typography></Box><Typography variant="body1">{content}</Typography></Box>;
