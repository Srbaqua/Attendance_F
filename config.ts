import { Platform } from 'react-native';

// Determine API base URL for development
const getDevelopmentApiUrl = () => 
  Platform.OS === 'android' || Platform.OS === 'ios'
    ? 'http://10.10.41.4:3000'
    : 'http://10.10.41.4:3000'; // Fallback for web

// Base URLs
export const BASE_URL = __DEV__ 
  ? getDevelopmentApiUrl() 
  : 'https://attendance-app-api.example.com';

// API base URL
export const API_URL = `${BASE_URL}/api`;

// App-wide configuration
export const APP_CONFIG = {
  APP_NAME: 'ClassCheck',
  APP_VERSION: '1.0.0',

  // Feature flags
  ENABLE_FACE_RECOGNITION: true,
  ENABLE_BLUETOOTH_PROXIMITY: true,

  // Timing configurations
  BLUETOOTH_SCAN_TIMEOUT: 10000, // 10 seconds
  ATTENDANCE_WINDOW: 15, // Minutes

  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    AUTH_USER: 'auth_user',
    APP_SETTINGS: 'app_settings',
  },

  // Default settings
  DEFAULT_SETTINGS: {
    enableNotifications: true,
    darkMode: false,
    proximityThreshold: -70,
  }
};

// Theme colors
export const COLORS = {
  primary: '#2196F3',
  secondary: '#03A9F4',
  accent: '#FF9800',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#212121',
  border: '#E0E0E0',
  notification: '#F44336',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
};

// API Endpoints
export const ENDPOINTS = {
  LOGIN: `${API_URL}/users/login`,
  REGISTER: `${API_URL}/users/register`,

  // Student
  REGISTER_FACE: `${API_URL}/students/register-face`,
  MARK_ATTENDANCE: `${API_URL}/attendance/mark`,
  STUDENT_HISTORY: `${API_URL}/attendance/history`,

  // Teacher
  ATTENDANCE_STATS: `${API_URL}/teacher/attendance-stats`,
  CLASS_MANAGEMENT: `${API_URL}/teacher/classes`,
  MANUAL_ATTENDANCE: `${API_URL}/teacher/manual-attendance`,
  TEACHER_HISTORY: `${API_URL}/teacher/history`,
};

// Debugging Test Endpoint
export const TEST_ENDPOINT = `${API_URL}/test`;
