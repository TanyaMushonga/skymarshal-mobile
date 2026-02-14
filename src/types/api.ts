// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// User Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  force_number: string;
  role: 'OFFICER' | 'SUPERVISOR' | 'ADMIN';
  is_active: boolean;
  phone_number?: string;
  avatar?: string;
  unit?: string;
  is_on_duty: boolean;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
  requires_2fa?: boolean;
  requires_password_change?: boolean;
}

// Patrol Types
export type PatrolStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Patrol {
  id: string;
  officer: User;
  drone: Drone;
  drone_id?: string;
  status: PatrolStatus;
  started_at: string;
  start_time?: string;
  ended_at?: string;
  end_time?: string;
  duration?: number;
  flight_duration_seconds?: number;
  detection_count: number;
  violation_count: number;
  speed_limit?: number;
  zone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  battery_level?: number;
}

export interface StartPatrolRequest {
  drone_id: string;
  speed_limit?: number;
  zone?: string;
}

// Drone Types
export type DroneStatus = 'online' | 'offline' | 'maintenance' | 'in_use';

export interface DroneStatusInfo {
  status: DroneStatus;
  battery_level: number;
  signal_strength: number;
}

export interface Drone {
  id: string;
  drone_id: string;
  name: string;
  model: string;
  serial_number: string;
  status: DroneStatusInfo;
  current_patrol?: string;
  gps?: {
    latitude: number;
    longitude: number;
  };
  altitude?: number;
  speed?: number;
  heading?: number;
  created_at: string;
  updated_at: string;
}

export interface DroneGPS {
  id: string;
  drone: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

// Detection Types
export type VehicleType = 'car' | 'truck' | 'motorcycle' | 'bus' | 'other';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface Detection {
  id: string;
  patrol: string;
  drone?: Drone;
  license_plate: string;
  license_plate_confidence?: number;
  confidence?: number;
  vehicle_type: VehicleType;
  vehicle_model?: string;
  color?: string;
  speed?: number;
  speed_limit?: number;
  gps?: GPSCoordinates;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  bounding_box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  timestamp: string;
  created_at: string;
}

// Violation Types
export type ViolationType = 'SPEEDING' | 'RED_LIGHT' | 'NO_SEATBELT' | 'ILLEGAL_PARKING' | 'OTHER';
export type ViolationStatus = 'NEW' | 'REVIEWED' | 'CONFIRMED' | 'DISMISSED';

export interface Violation {
  id: string;
  detection: Detection;
  patrol: string;
  violation_type: ViolationType;
  status: ViolationStatus;
  recorded_speed?: number;
  speed_limit?: number;
  evidence_url?: string;
  video_url?: string;
  notes?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  created_at: string;
  updated_at: string;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Notification Types
export type NotificationType =
  | 'VIOLATION'
  | 'PATROL'
  | 'SYSTEM'
  | 'ALERT'
  | 'low_battery'
  | 'emergency';

export interface Notification {
  id: string;
  user: string;
  notification_type: NotificationType;
  title: string;
  body: string;
  message?: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  related_violation?: string;
  related_patrol?: string;
  created_at: string;
}

// Dashboard Types
export interface TodayStats {
  patrols: number;
  detections: number;
  violations: number;
}

export interface DashboardStats {
  today_stats: TodayStats;
  active_patrol?: Patrol & {
    battery_level?: number;
    flight_duration_seconds?: number;
  };
  recent_alerts: Violation[];
  // Deprecated fields (will keep for backward compatibility during migration)
  today_patrols?: number;
  today_detections?: number;
  today_violations?: number;
}

export interface OfficerStats {
  hours_patrolled_this_week: number;
  performance_rating: number;
}
