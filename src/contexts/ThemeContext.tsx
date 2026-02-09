import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors, type ColorScheme, type ThemeColors } from '@/constants/colors';
import { useSettingsStore } from '@/stores/settingsStore';

interface ThemeContextValue {
  theme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: ColorScheme | 'system') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { theme: themeSetting, setTheme: setThemeSetting } = useSettingsStore();
  const [activeTheme, setActiveTheme] = useState<ColorScheme>('light');

  useEffect(() => {
    if (themeSetting === 'system') {
      setActiveTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    } else {
      setActiveTheme(themeSetting);
    }
  }, [themeSetting, systemColorScheme]);

  const value = useMemo(
    () => ({
      theme: activeTheme,
      colors: colors[activeTheme],
      isDark: activeTheme === 'dark',
      setTheme: setThemeSetting,
    }),
    [activeTheme, setThemeSetting]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
