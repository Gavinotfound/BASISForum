import { createTheme } from '@mui/material/styles';
import { themeModes, type DisplayMode } from './theme-config';

export const createBasisTheme = (mode: DisplayMode = 'dark') => {
  const tokens = themeModes[mode];
  return createTheme({
    palette: {
      mode: tokens.isDark ? 'dark' : 'light',
      primary: { main: tokens.text, light: tokens.text, dark: tokens.muted, contrastText: tokens.background },
      secondary: { main: tokens.text, light: tokens.text, dark: tokens.muted, contrastText: tokens.background },
      info: { main: tokens.text, light: tokens.text, dark: tokens.muted, contrastText: tokens.background },
      success: { main: tokens.text },
      warning: { main: tokens.muted },
      error: { main: tokens.burgundy, light: tokens.burgundyHover, dark: '#4C1019', contrastText: '#FFFFFF' },
      background: { default: tokens.background, paper: tokens.surface },
      text: { primary: tokens.text, secondary: tokens.muted },
      divider: tokens.divider,
    },
    typography: {
      fontFamily: 'Inter, Helvetica, Arial, ui-sans-serif, system-ui, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '1.1rem', lineHeight: 1.15 },
      h2: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '1.1rem', lineHeight: 1.15 },
      h3: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '1.1rem', lineHeight: 1.15 },
      h4: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '1.1rem', lineHeight: 1.15 },
      h5: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1rem', lineHeight: 1.2 },
      h6: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1rem', lineHeight: 1.2 },
      body1: { fontSize: '0.875rem', lineHeight: 1.55 },
      body2: { fontSize: '0.78rem', lineHeight: 1.45 },
      caption: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '0.68rem', letterSpacing: '.04em' },
      overline: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 600, letterSpacing: '.12em', fontSize: '0.64rem', lineHeight: 1.25 },
      button: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '.1em', fontSize: '0.66rem' },
    },
    shape: { borderRadius: 0 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { backgroundColor: tokens.background },
          body: { margin: 0, backgroundColor: tokens.background, backgroundImage: 'none', color: tokens.text },
          '*': { borderRadius: '0 !important', boxShadow: 'none !important' },
          '::selection': { backgroundColor: tokens.text, color: tokens.selectionForeground },
          'select option': { backgroundColor: tokens.surface, color: tokens.text },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            minHeight: 38,
            padding: '9px 14px',
            transition: 'background-color 120ms linear, color 120ms linear',
            '&:hover': { transform: 'none', boxShadow: 'none', backgroundColor: tokens.navy, color: '#FFFFFF' },
            '&:focus-visible': { outline: `1px solid ${tokens.navy}`, outlineOffset: 2 },
            '&.MuiButton-contained.MuiButton-colorPrimary, &.MuiButton-contained.MuiButton-colorSecondary': {
              backgroundColor: tokens.text,
              color: tokens.background,
              '&:hover': { backgroundColor: tokens.navy, color: '#FFFFFF' },
            },
            '&.MuiButton-contained.MuiButton-colorError': {
              backgroundColor: tokens.burgundy,
              color: '#FFFFFF',
              '&:hover': { backgroundColor: tokens.burgundyHover },
            },
            '&.MuiButton-outlined': {
              borderColor: tokens.controlBorder,
              color: tokens.text,
              backgroundColor: 'transparent',
              '&:hover': { borderColor: tokens.navy, backgroundColor: tokens.navy, color: '#FFFFFF' },
            },
          },
        },
      },
      MuiPaper: { styleOverrides: { root: { borderRadius: 0, backgroundColor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none', backdropFilter: 'none' } } },
      MuiCard: { styleOverrides: { root: { borderRadius: 0, backgroundColor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none', overflow: 'visible' } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 0, backgroundColor: 'transparent', color: tokens.text, border: `1px solid ${tokens.controlBorder}`, fontWeight: 700 } } },
      MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 0, backgroundColor: 'transparent' } } } },
      MuiMenu: { styleOverrides: { paper: { borderRadius: 0, backgroundColor: tokens.surface, backgroundImage: 'none', color: tokens.text, border: `1px solid ${tokens.divider}`, boxShadow: 'none' }, list: { padding: 0 } } },
      MuiPopover: { styleOverrides: { paper: { borderRadius: 0, backgroundColor: tokens.surface, backgroundImage: 'none', color: tokens.text, border: `1px solid ${tokens.divider}`, boxShadow: 'none' } } },
      MuiMenuItem: { styleOverrides: { root: { minHeight: 36, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '0.68rem', letterSpacing: '.06em', '&:hover, &.Mui-focusVisible': { backgroundColor: tokens.navy, color: '#FFFFFF' }, '&.Mui-selected': { backgroundColor: tokens.text, color: tokens.background }, '&.Mui-selected:hover': { backgroundColor: tokens.navy, color: '#FFFFFF' } } } },
      MuiSelect: { styleOverrides: { select: { '&:focus': { backgroundColor: 'transparent' } } } },
      MuiDivider: { styleOverrides: { root: { borderColor: tokens.divider } } },
    },
  });
};

export const theme = createBasisTheme('dark');
