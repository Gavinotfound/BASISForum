'use client';

import React from 'react';
import { Box, MenuItem, Select, Tooltip } from '@mui/material';
import { languageLabels, locales, type Locale, translate } from './i18n';

export type { Locale } from './i18n';

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
};

export const LanguageProvider = ({ children, initialLocale = 'en' }: { children: React.ReactNode; initialLocale?: Locale }) => {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);

  React.useEffect(() => {
    const saved = window.localStorage.getItem('basis_locale');
    if (saved && locales.includes(saved as Locale)) setLocaleState(saved as Locale);
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem('basis_locale', locale);
    document.cookie = `basis_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  const value = React.useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale: setLocaleState,
    t: (key, vars) => translate(locale, key, vars),
  }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const LanguageSelector = ({ compact = false }: { compact?: boolean }) => {
  const { locale, setLocale, t } = useLanguage();
  return (
    <Tooltip title={t('nav.language')}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', minWidth: compact ? 72 : 118 }}>
        <Select
          value={locale}
          onChange={(event) => {
            const nextLocale = event.target.value as Locale;
            window.localStorage.setItem('basis_locale', nextLocale);
            document.cookie = `basis_locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
            setLocale(nextLocale);
            window.setTimeout(() => window.location.reload(), 80);
          }}
          size="small"
          variant="standard"
          inputProps={{ 'aria-label': t('nav.language') }}
          sx={{ color: 'text.primary', fontWeight: 700, fontSize: 11, '&:before, &:after': { display: 'none' }, '& .MuiSelect-icon': { color: 'text.secondary' }, '& .MuiSelect-select': { py: 0.4, pr: '20px !important' } }}
        >
          {locales.map((code) => <MenuItem key={code} value={code}>{compact ? code : languageLabels[code]}</MenuItem>)}
        </Select>
      </Box>
    </Tooltip>
  );
};
