import api from './client';
import { endpoints } from '@/constants/config';
import type { User, LoginResponse, AuthTokens } from '@/types/api';
import { setAccessToken, setRefreshToken, setUserData, clearTokens } from '@/lib/secureStorage';

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
    const response = await api.post<LoginResponse>(endpoints.LOGIN, credentials);
    const data = response.data;

    // Store tokens if login successful and no 2FA required
    if (data.tokens && !data.requires_2fa) {
      await setAccessToken(data.tokens.access);
      await setRefreshToken(data.tokens.refresh);
      await setUserData(data.user);
    }

    return data;
  },

  /**
   * Verify 2FA code
   */
  async verify2FA(payload: Verify2FAPayload): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(endpoints.VERIFY_2FA, payload);
    const data = response.data;

    if (data.tokens) {
      await setAccessToken(data.tokens.access);
      await setRefreshToken(data.tokens.refresh);
      await setUserData(data.user);
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
      await api.post(endpoints.LOGOUT);
    } catch (error) {
      // Continue with local logout even if server request fails
      console.warn('Logout request failed:', error);
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
