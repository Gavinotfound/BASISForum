'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import { Navbar, type ForumUser } from './src/components';
import { LanguageProvider, type Locale } from './src/LanguageProvider';
import { DisplayModeProvider } from './src/DisplayModeProvider';
import type { DisplayMode } from './src/theme-config';

export * from './src/theme';
export * from './src/theme-config';
export * from './src/components';
export * from './src/i18n';
export * from './src/LanguageProvider';
export * from './src/DisplayModeProvider';

export const BasisProvider = ({ children, locale = 'en', mode = 'dark' }: { children: React.ReactNode; locale?: Locale; mode?: DisplayMode }) => (
  <DisplayModeProvider initialMode={mode}>
    <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
  </DisplayModeProvider>
);

type LayoutProps = {
  children: React.ReactNode;
  user?: ForumUser;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onSearch?: () => void;
  onProfile?: () => void;
  onBookmarks?: () => void;
  onNotifications?: () => void;
  onHome?: () => void;
};

export const Layout = ({ children, user, onSignIn, onSignOut, onSearch, onProfile, onBookmarks, onNotifications, onHome }: LayoutProps) => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    <Navbar user={user} onSignIn={onSignIn} onSignOut={onSignOut} onSearch={onSearch} onProfile={onProfile} onBookmarks={onBookmarks} onNotifications={onNotifications} onHome={onHome} />
    <Container maxWidth={false} sx={{ maxWidth: { lg: 1440, xl: 1680 }, px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: { xs: 1.75, sm: 2.25, lg: 3 } }}>
      {children}
    </Container>
  </Box>
);
