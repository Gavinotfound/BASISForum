export type DisplayMode = 'dark' | 'light' | 'low-contrast' | 'amot';

export type ThemeTokens = {
  label: string;
  isDark: boolean;
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  muted: string;
  divider: string;
  controlBorder: string;
  navy: string;
  burgundy: string;
  burgundyHover: string;
  selectionForeground: string;
};

/**
 * Single source of truth for all BasisForum visual tokens.
 * Add future visual modes here; the shared theme factory and mode selector will pick them up automatically.
 */
export const themeModes: Record<DisplayMode, ThemeTokens> = {
  dark: {
    label: 'Dark',
    isDark: true,
    background: '#000000',
    surface: '#000000',
    surfaceHover: '#112B55',
    text: '#FFFFFF',
    muted: '#A3A3A3',
    divider: '#404040',
    controlBorder: '#666666',
    navy: '#112B55',
    burgundy: '#6F1D2A',
    burgundyHover: '#8E2D3A',
    selectionForeground: '#000000',
  },
  light: {
    label: 'Light',
    isDark: false,
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceHover: '#112B55',
    text: '#000000',
    muted: '#5E5E5E',
    divider: '#B7B7B7',
    controlBorder: '#7A7A7A',
    navy: '#112B55',
    burgundy: '#6F1D2A',
    burgundyHover: '#8E2D3A',
    selectionForeground: '#FFFFFF',
  },
  'low-contrast': {
    label: 'Low contrast',
    isDark: true,
    background: '#121212',
    surface: '#121212',
    surfaceHover: '#112B55',
    text: '#E7E7E7',
    muted: '#A0A0A0',
    divider: '#353535',
    controlBorder: '#5C5C5C',
    navy: '#112B55',
    burgundy: '#6F1D2A',
    burgundyHover: '#8E2D3A',
    selectionForeground: '#121212',
  },
  amot: {
    label: 'AMOT',
    isDark: true,
    background: '#0A1118',
    surface: '#0A1118',
    surfaceHover: '#1E3A8A',
    text: '#F0F4F8',
    muted: '#94A3B8',
    divider: '#314157',
    controlBorder: '#586B85',
    navy: '#0022FF',
    burgundy: '#6F1D2A',
    burgundyHover: '#8E2D3A',
    selectionForeground: '#0A1118',
  },
};

export const displayModes = Object.keys(themeModes) as DisplayMode[];

export const isDisplayMode = (value: string | null | undefined): value is DisplayMode =>
  Boolean(value && displayModes.includes(value as DisplayMode));
