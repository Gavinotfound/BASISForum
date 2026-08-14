export type DisplayMode = 'dark' | 'light' | 'low-contrast' | 'amot' | 'archive' | 'verdigris' | 'sakura';

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
  interactive: string;
  interactiveHover: string;
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
    interactive: '#112B55',
    interactiveHover: '#112B55',
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
    interactive: '#112B55',
    interactiveHover: '#112B55',
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
    interactive: '#112B55',
    interactiveHover: '#112B55',
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
    interactive: '#0022FF',
    interactiveHover: '#0022FF',
    burgundy: '#6F1D2A',
    burgundyHover: '#8E2D3A',
    selectionForeground: '#0A1118',
  },
  archive: {
    label: 'Archive',
    isDark: false,
    background: '#F7F0E3',
    surface: '#F7F0E3',
    surfaceHover: '#D8E7E4',
    text: '#15211D',
    muted: '#526158',
    divider: '#6C756C',
    controlBorder: '#809087',
    interactive: '#1B5E76',
    interactiveHover: '#174B5E',
    burgundy: '#812D37',
    burgundyHover: '#A43B45',
    selectionForeground: '#F7F0E3',
  },
  verdigris: {
    label: 'Verdigris',
    isDark: true,
    background: '#0D1B16',
    surface: '#0D1B16',
    surfaceHover: '#163D34',
    text: '#EAF7EF',
    muted: '#B0C7BA',
    divider: '#557064',
    controlBorder: '#6C8B7B',
    interactive: '#1F7A6E',
    interactiveHover: '#185E55',
    burgundy: '#9C3444',
    burgundyHover: '#BC4758',
    selectionForeground: '#FFFFFF',
  },
  sakura: {
    label: 'Sakura',
    isDark: false,
    background: '#FFF6F8',
    surface: '#FFF6F8',
    surfaceHover: '#F7DDE5',
    text: '#2A1420',
    muted: '#6B4B5B',
    divider: '#9A6D7D',
    controlBorder: '#B68595',
    interactive: '#A82E5B',
    interactiveHover: '#862447',
    burgundy: '#7B263D',
    burgundyHover: '#9B3853',
    selectionForeground: '#FFFFFF',
  },
};

export const displayModes = Object.keys(themeModes) as DisplayMode[];

export const isDisplayMode = (value: string | null | undefined): value is DisplayMode =>
  Boolean(value && displayModes.includes(value as DisplayMode));
