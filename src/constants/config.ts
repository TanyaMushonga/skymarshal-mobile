export const config = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.skymarshal.com/api',
  APP_NAME: 'SkyMarshal',
  APP_VERSION: '1.0.0',

  // Token storage keys
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_DATA_KEY: 'user_data',

  // API timeouts (ms)
  API_TIMEOUT: 30000,
  REFRESH_TIMEOUT: 10000,

  // Polling intervals (ms)
  PATROL_POLL_INTERVAL: 5000,
  NOTIFICATION_POLL_INTERVAL: 30000,

  // Map defaults
  DEFAULT_MAP_REGION: {
    latitude: -17.8292,
    longitude: 31.0522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
} as const;

export const endpoints = {
  // Auth
  LOGIN: '/auth/login/officer/',
  VERIFY_2FA: '/auth/verify-2fa/',
  REFRESH_TOKEN: '/auth/refresh/',
  LOGOUT: '/auth/logout/',
  PASSWORD_RESET_REQUEST: '/auth/password-reset/officer/request/',
  PASSWORD_RESET_VERIFY: '/auth/password-reset/officer/verify/',
  PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm/',
  CHANGE_PASSWORD: '/change-password/',

  // User
  ME: '/users/me/',

  // Patrols
  PATROLS: '/patrols/',
  PATROL_START: '/patrols/start/',
  PATROL_END: (id: string) => `/patrols/${id}/end/`,

  // Drones
  DRONES: '/drones/',
  DRONE_GPS: (id: string) => `/drones/${id}/gps/`,

  // Detections
  DETECTIONS: '/detections/',

  // Violations
  VIOLATIONS: '/violations/',

  // Notifications
  NOTIFICATIONS: '/notifications/',
  NOTIFICATION_MARK_READ: (id: string) => `/notifications/${id}/mark_read/`,
  NOTIFICATIONS_MARK_ALL_READ: '/notifications/mark_all_read/',
  NOTIFICATIONS_BULK_DELETE: '/notifications/bulk_delete/',

  // Analytics
  DASHBOARD: '/analytics/dashboard/',
} as const;
