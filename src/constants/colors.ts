export const colors = {
  light: {
    primary: '#F59E0B',
    primaryDark: '#D97706',
    primaryLight: '#FCD34D',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  dark: {
    primary: '#FBBF24',
    primaryDark: '#F59E0B',
    primaryLight: '#FDE68A',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
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
