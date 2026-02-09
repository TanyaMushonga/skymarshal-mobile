import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ColorScheme } from '@/constants/colors';

export interface SettingsState {
  theme: ColorScheme | 'system';
  notificationsEnabled: boolean;
  biometricEnabled: boolean;
  language: string;

  // Actions
  setTheme: (theme: ColorScheme | 'system') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      notificationsEnabled: true,
      biometricEnabled: false,
      language: 'en',

      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'skymarshal-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
