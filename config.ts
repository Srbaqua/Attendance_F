// src/config.ts

// API base URL - adjust based on your environment setup
export const API_URL = __DEV__ 
  ? 'http://localhost:3000'  // Development server
  : 'https://attendance-app-api.example.com';  // Production server

// App-wide configuration
export const APP_CONFIG = {
  // App info
  APP_NAME: 'ClassCheck',
  APP_VERSION: '1.0.0',
  
  // Feature flags
  ENABLE_FACE_RECOGNITION: true,
  ENABLE_BLUETOOTH_PROXIMITY: true,
  
  // Timing configurations
  BLUETOOTH_SCAN_TIMEOUT: 10000, // 10 seconds
  ATTENDANCE_WINDOW: 15, // Minutes a student can mark attendance after class starts
  
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
    proximityThreshold: -70, // RSSI threshold for Bluetooth proximity
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

// Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/api/users/login',
  REGISTER: '/api/users/register',
  
  // Student
  REGISTER_FACE: '/api/students/register-face',
  MARK_ATTENDANCE: '/api/attendance/mark',
  STUDENT_HISTORY: '/api/attendance/history',
  
  // Teacher
  ATTENDANCE_STATS: '/api/teacher/attendance-stats',
  CLASS_MANAGEMENT: '/api/teacher/classes',
  MANUAL_ATTENDANCE: '/api/teacher/manual-attendance',
  TEACHER_HISTORY: '/api/teacher/history',
};