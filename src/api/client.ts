import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { config, endpoints } from '@/constants/config';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from '@/lib/secureStorage';

/**
 * Interface for formatted Django errors
 */
export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string[]>;
  status?: number;
  code?: string;
  originalError: AxiosError;
}

/**
 * Standard DRF Error Response structure
 */
interface DrfErrorResponse {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: any; // For field-specific errors
}

// --- Error Formatting Logic ---

/**
 * Parses complex Django REST Framework errors into a flat, readable format
 */
const formatApiError = (error: AxiosError<DrfErrorResponse>): ApiError => {
  const data = error.response?.data;
  const status = error.response?.status;

  let message = 'An unexpected error occurred. Please try again.';
  let fieldErrors: Record<string, string[]> | undefined;

  if (data) {
    // 1. Handle "detail" key (common in auth/permission errors)
    if (typeof data.detail === 'string') {
      message = data.detail;
    }
    // 2. Handle "non_field_errors"
    else if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      message = data.non_field_errors[0];
    }
    // 3. Handle specific field errors
    else {
      const fields = Object.keys(data).filter(
        (key) => key !== 'detail' && key !== 'non_field_errors'
      );
      if (fields.length > 0) {
        fieldErrors = {};
        fields.forEach((field) => {
          if (Array.isArray(data[field])) {
            fieldErrors![field] = data[field];
          } else if (typeof data[field] === 'string') {
            fieldErrors![field] = [data[field]];
          }
        });

        // Use the first field's first error as the primary message
        const firstField = fields[0];
        const firstError = Array.isArray(data[firstField]) ? data[firstField][0] : data[firstField];
        message = `${firstField}: ${firstError}`;
      }
    }
  } else if (error.request) {
    message = 'No response from server. Check your internet connection.';
  }

  return {
    message,
    fieldErrors,
    status,
    code: (data as any)?.code,
    originalError: error,
  };
};

// --- API Client Implementation ---

const api: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

type AuthFailureCallback = () => void;
let onAuthFailureCallback: AuthFailureCallback | null = null;

/**
 * Register a listener to handle global authentication failures (e.g., redirect to login)
 */
export const setAuthFailureListener = (callback: AuthFailureCallback) => {
  onAuthFailureCallback = callback;
};

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Inject JWT Token
api.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (__DEV__) {
      console.log(
        `[API Request] ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`,
        token ? `(Auth: Bearer ${token.substring(0, 10)}...)` : '(No Auth)'
      );
    }

    return requestConfig;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Data & Token Refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log success in development
    if (__DEV__) {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError<DrfErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 1. Handle Token Refresh (401 Unauthorized)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/') // Don't loop on login/refresh calls
    ) {
      if (isRefreshing) {
        // Queue the request if a refresh is already in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (__DEV__) {
          console.log('[API Client] 401 Unauthorized. Attempting token refresh...');
        }

        if (!refreshToken) {
          if (__DEV__) console.warn('[API Client] No refresh token available, session expired.');
          throw new Error('Session expired');
        }

        // Use a separate axios instance for refresh to avoid interceptor loops
        const response = await axios.post(
          `${config.API_BASE_URL}${endpoints.REFRESH_TOKEN}`,
          { refresh: refreshToken },
          { timeout: config.REFRESH_TIMEOUT }
        );

        const { access, refresh } = response.data;

        // Store new tokens
        await setAccessToken(access);
        if (refresh) {
          await setRefreshToken(refresh);
        }

        processQueue(null, access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (token expired/revoked)
        processQueue(refreshError as Error, null);
        await clearTokens();

        if (onAuthFailureCallback) {
          onAuthFailureCallback();
        }

        return Promise.reject(formatApiError(refreshError as AxiosError<DrfErrorResponse>));
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Format and Return other errors
    const formattedError = formatApiError(error);

    if (__DEV__) {
      console.error(
        `[API Error] ${formattedError.status} ${formattedError.message}`,
        formattedError.fieldErrors
      );
    }

    return Promise.reject(formattedError);
  }
);

export default api;
