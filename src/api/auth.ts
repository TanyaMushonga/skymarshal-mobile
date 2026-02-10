import api from './client';
import { endpoints } from '@/constants/config';
import type { User, LoginResponse, AuthTokens } from '@/types/api';
import {
  setAccessToken,
  setRefreshToken,
  setUserData,
  clearTokens,
  getRefreshToken,
} from '@/lib/secureStorage';

export interface LoginCredentials {
  email?: string;
  force_number?: string;
  password: string;
}

export interface Verify2FAPayload {
  code: string;
  temp_token: string;
}

export interface PasswordResetRequest {
  email?: string;
  force_number?: string;
}

export interface PasswordResetVerify {
  email?: string;
  force_number?: string;
  code: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const authApi = {
  /**
   * Login with email/force_number and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log(`[AuthAPI] POST to ${endpoints.LOGIN}`);
    const response = await api.post<LoginResponse>(endpoints.LOGIN, credentials);
    const data = response.data;

    if (__DEV__) {
      console.log('[AuthAPI] Login raw response data:', JSON.stringify(data, null, 2));
    }

    // Extract tokens robustly (they might be in data.tokens or directly in data)
    const access = data.tokens?.access || (data as any).access;
    const refresh = data.tokens?.refresh || (data as any).refresh;

    if (__DEV__) {
      console.log('[AuthAPI] Extracted tokens:', {
        hasAccess: !!access,
        hasRefresh: !!refresh,
        requires2FA: data.requires_2fa,
      });
    }

    // Store tokens if login successful and no 2FA required
    if (access && !data.requires_2fa) {
      await setAccessToken(access);
      if (refresh) await setRefreshToken(refresh);
      if (data.user) await setUserData(data.user);
      console.log('[AuthAPI] Tokens and user data saved successfully');
    }

    return data;
  },

  /**
   * Verify 2FA code
   */
  async verify2FA(payload: Verify2FAPayload): Promise<LoginResponse> {
    console.log(`[AuthAPI] POST to ${endpoints.VERIFY_2FA}`);
    const response = await api.post<LoginResponse>(endpoints.VERIFY_2FA, payload);
    const data = response.data;

    if (__DEV__) {
      console.log('[AuthAPI] Verify2FA raw response data:', JSON.stringify(data, null, 2));
    }

    // Extract tokens robustly
    const access = data.tokens?.access || (data as any).access;
    const refresh = data.tokens?.refresh || (data as any).refresh;

    if (access) {
      await setAccessToken(access);
      if (refresh) await setRefreshToken(refresh);
      if (data.user) await setUserData(data.user);
      console.log('[AuthAPI] 2FA Verification successful, tokens saved');
    }

    return data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>(endpoints.REFRESH_TOKEN, {
      refresh: refreshToken,
    });
    return response.data;
  },

  /**
   * Logout and clear tokens
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await getRefreshToken();
      await api.post(endpoints.LOGOUT, { refresh: refreshToken });
    } catch (error) {
      // Continue with local logout even if server request fails
      console.warn('[AuthAPI] Logout request failed:', error);
    } finally {
      await clearTokens();
    }
  },

  /**
   * Request password reset code
   */
  async requestPasswordReset(payload: PasswordResetRequest): Promise<{ message: string }> {
    const response = await api.post(endpoints.PASSWORD_RESET_REQUEST, payload);
    return response.data;
  },

  /**
   * Verify password reset code
   */
  async verifyPasswordResetCode(payload: PasswordResetVerify): Promise<{ token: string }> {
    const response = await api.post(endpoints.PASSWORD_RESET_VERIFY, payload);
    return response.data;
  },

  /**
   * Confirm new password
   */
  async confirmPasswordReset(payload: PasswordResetConfirm): Promise<{ message: string }> {
    const response = await api.post(endpoints.PASSWORD_RESET_CONFIRM, payload);
    return response.data;
  },

  /**
   * Change password (authenticated)
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    const response = await api.post(endpoints.CHANGE_PASSWORD, payload);
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const response = await api.get<User>(endpoints.ME);
    return response.data;
  },

  /**
   * Update current user profile
   */
  async updateMe(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>(endpoints.ME, data);
    await setUserData(response.data);
    return response.data;
  },
};
