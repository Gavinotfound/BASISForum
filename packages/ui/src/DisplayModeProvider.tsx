'use client';

import React from 'react';
import { Box, CssBaseline, MenuItem, Select, ThemeProvider, Tooltip } from '@mui/material';
import { createBasisTheme } from './theme';
import { displayModes, isDisplayMode, themeModes, type DisplayMode } from './theme-config';

type DisplayModeContextValue = {
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
};

const DisplayModeContext = React.createContext<DisplayModeContextValue | null>(null);

export const useDisplayMode = () => {
  const context = React.useContext(DisplayModeContext);
  if (!context) throw new Error('useDisplayMode must be used inside DisplayModeProvider');
  return context;
};

export const DisplayModeProvider = ({ children, initialMode = 'dark' }: { children: React.ReactNode; initialMode?: DisplayMode }) => {
  const [mode, setModeState] = React.useState<DisplayMode>(initialMode);
  const muiTheme = React.useMemo(() => createBasisTheme(mode), [mode]);

  React.useEffect(() => {
    const saved = window.localStorage.getItem('basis_display_mode');
    if (isDisplayMode(saved)) setModeState(saved);
  }, []);

  React.useEffect(() => {
    const tokens = themeModes[mode];
    const root = document.documentElement;
    root.dataset.basisMode = mode;
    root.style.colorScheme = tokens.isDark ? 'dark' : 'light';
    root.style.setProperty('--bf-bg', tokens.background);
    root.style.setProperty('--bf-surface', tokens.surface);
    root.style.setProperty('--bf-hover', tokens.surfaceHover);
    root.style.setProperty('--bf-text', tokens.text);
    root.style.setProperty('--bf-muted', tokens.muted);
    root.style.setProperty('--bf-divider', tokens.divider);
    root.style.setProperty('--bf-control-border', tokens.controlBorder);
    root.style.setProperty('--bf-navy', tokens.navy);
    root.style.setProperty('--bf-burgundy', tokens.burgundy);
    window.localStorage.setItem('basis_display_mode', mode);
    document.cookie = `basis_display_mode=${mode}; path=/; max-age=31536000; samesite=lax`;
  }, [mode]);

  const value = React.useMemo<DisplayModeContextValue>(() => ({ mode, setMode: setModeState }), [mode]);
  return <ThemeProvider theme={muiTheme}><CssBaseline /><DisplayModeContext.Provider value={value}>{children}</DisplayModeContext.Provider></ThemeProvider>;
};

export const DisplayModeSelector = ({ compact = false }: { compact?: boolean }) => {
  const { mode, setMode } = useDisplayMode();
  return <Tooltip title="Display mode"><Box sx={{ display: 'inline-flex', alignItems: 'center', minWidth: compact ? 76 : 136 }}>
    <Select
      value={mode}
      onChange={(event) => setMode(event.target.value as DisplayMode)}
      size="small"
      variant="standard"
      inputProps={{ 'aria-label': 'Display mode' }}
      sx={{ color: 'text.primary', fontWeight: 700, fontSize: 11, '&:before, &:after': { display: 'none' }, '& .MuiSelect-icon': { color: 'text.secondary' }, '& .MuiSelect-select': { py: 0.4, pr: '20px !important' } }}
    >
      {displayModes.map((value) => <MenuItem key={value} value={value}>{compact ? value.toUpperCase() : themeModes[value].label}</MenuItem>)}
    </Select>
  </Box></Tooltip>;
};
