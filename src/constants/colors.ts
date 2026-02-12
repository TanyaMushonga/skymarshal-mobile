export const colors = {
  light: {
    primary: '#F59E0B',
    primaryDark: '#D97706',
    primaryLight: '#FCD34D',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#000000',
    textSecondary: '#666666',
    border: '#EEEEEE',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  dark: {
    primary: '#F59E0B', // Standardized professional gold
    primaryDark: '#B45309',
    primaryLight: '#FBBF24',
    background: '#000000', // Pure black for OLED
    surface: '#0A0A0A', // Very dark grey for depth
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#1A1A1A',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
};
