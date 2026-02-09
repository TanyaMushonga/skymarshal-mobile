import { create } from 'zustand';
import type { User } from '@/types/api';
import { authApi } from '@/api/auth';
import { getAccessToken, getUserData, clearTokens, setUserData } from '@/lib/secureStorage';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
  tempToken: string | null;
  requiresPasswordChange: boolean;

  // Actions
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRequires2FA: (requires: boolean, tempToken?: string) => void;
  setRequiresPasswordChange: (requires: boolean) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  requires2FA: false,
  tempToken: null,
  requiresPasswordChange: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const token = await getAccessToken();
      if (token) {
        const userData = await getUserData<User>();
        if (userData) {
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
          // Optionally refresh user data from server
          get().refreshUser();
        } else {
          // Token exists but no user data, fetch from server
          try {
            const user = await authApi.getMe();
            await setUserData(user);
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch {
            // Token likely invalid
            await clearTokens();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      requires2FA: false,
      tempToken: null,
    });
  },

  setRequires2FA: (requires, tempToken) => {
    set({
      requires2FA: requires,
      tempToken: tempToken || null,
    });
  },

  setRequiresPasswordChange: (requires) => {
    set({ requiresPasswordChange: requires });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        requires2FA: false,
        tempToken: null,
        requiresPasswordChange: false,
      });
    }
  },

  refreshUser: async () => {
    try {
      const user = await authApi.getMe();
      await setUserData(user);
      set({ user });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },
}));
