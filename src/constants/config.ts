export const config = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL!,
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
  // Authentication (Namespace: api/v1/auth/)
  LOGIN: '/v1/auth/login/officer/',
  VERIFY_2FA: '/v1/auth/verify-2fa/',
  REFRESH_TOKEN: '/v1/auth/refresh/',
  LOGOUT: '/v1/auth/logout/',
  PASSWORD_RESET_REQUEST: '/v1/auth/password-reset/officer/request/',
  PASSWORD_RESET_VERIFY: '/v1/auth/password-reset/officer/verify/',
  PASSWORD_RESET_CONFIRM: '/v1/auth/password-reset/confirm/',

  // User (Specific actions on UserViewSet)
  CHANGE_PASSWORD: '/v1/users/change-password/',
  ME: '/v1/users/me/',
  TOGGLE_DUTY: '/v1/users/toggle-duty/',

  // Patrols (apps.patrols.urls)
  PATROLS: '/v1/patrols/',
  PATROL_START: '/v1/patrols/start/',
  PATROL_END: (id: string) => `/v1/patrols/${id}/end/`,

  // Drones (apps.drones.urls - uses drone_id like "DR-001" as lookup)
  DRONES: '/v1/drones/',
  DRONE_DETAIL: (droneId: string) => `/v1/drones/${droneId}/`,
  DRONE_STATUS: (droneId: string) => `/v1/drones/${droneId}/status/`,
  DRONE_HISTORY: (droneId: string) => `/v1/drones/${droneId}/history/`,
  GPS_LOCATIONS: '/v1/gps-locations/',

  // Detections & Violations (Note: registered as 'events' in their respective urls.py)
  DETECTIONS: '/v1/detections/events/',
  VIOLATIONS: '/v1/violations/events/',

  // Notifications (api/v1/notifications/)
  NOTIFICATIONS: '/v1/notifications/',
  NOTIFICATION_MARK_READ: (id: string) => `/v1/notifications/${id}/mark_read/`,
  NOTIFICATIONS_MARK_ALL_READ: '/v1/notifications/mark_all_read/',
  NOTIFICATIONS_BULK_DELETE: '/v1/notifications/bulk_delete/',

  // Analytics (Namespace: api/v1/analytics/)
  OFFICER_STATS: '/v1/analytics/officer/my_stats/',
  ADMIN_DASHBOARD: '/v1/analytics/admin/dashboard/',
  DASHBOARD_SUMMARY: '/v1/analytics/dashboard/summary/',

  // Compliance (Namespace: api/v1/compliance/)
  LOTTERIES: '/v1/compliance/lotteries/',

  // Vehicles
  VEHICLE_LOOKUP: '/v1/vehicles/lookup/',
  CLEAR_FINES: '/v1/vehicles/clear-fines/',
  RECORD_PAYMENT: '/v1/vehicles/record-payment/',
} as const;
