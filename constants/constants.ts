// Application constants and configurations

export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  GURU: 'guru',
  SANTRI: 'santri',
  ORTU: 'ortu',
  YAYASAN: 'yayasan'
} as const;

export const STATUS_HAFALAN = {
  ZIYADAH: 'ziyadah',
  MUROJAAH: 'murojaah'
} as const;

export const STATUS_TARGET = {
  BELUM: 'belum',
  PROSES: 'proses',
  SELESAI: 'selesai'
} as const;

export const STATUS_ABSENSI = {
  MASUK: 'masuk',
  IZIN: 'izin',
  ALPHA: 'alpha'
} as const;

export const HARI = {
  SENIN: 'Senin',
  SELASA: 'Selasa',
  RABU: 'Rabu',
  KAMIS: 'Kamis',
  JUMAT: 'Jumat',
  SABTU: 'Sabtu',
  MINGGU: 'Minggu'
} as const;

export const SEMESTER = {
  S1: 'S1',
  S2: 'S2'
} as const;

// API Response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Common validation rules
export const VALIDATION_RULES = {
  MIN_SANTRI_PER_HALAQAH: 5,
  MAX_SANTRI_PER_HALAQAH: 20,
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  FULL: 'dddd, DD MMMM YYYY'
} as const;

// Default pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/mp3']
} as const;

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  HALAQAH_LIST: 'halaqah_list',
  SANTRI_LIST: 'santri_list',
  DASHBOARD_STATS: 'dashboard_stats'
} as const;

// Navigation paths
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: {
    SUPER_ADMIN: '/super-admin/dashboard',
    ADMIN: '/admin/dashboard',
    GURU: '/guru/dashboard',
    SANTRI: '/santri/dashboard',
    ORTU: '/ortu/dashboard',
    YAYASAN: '/yayasan/dashboard'
  }
} as const;