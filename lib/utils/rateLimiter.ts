/**
 * Rate Limiter utility for login attempts
 */

interface LoginAttempt {
  attempts: number;
  lastAttempt: number;
  lockoutUntil?: number;
}

const LOGIN_ATTEMPTS_KEY = 'login_attempts';
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 10;
const BASE_LOCKOUT_DURATION = 30 * 1000; // 30 seconds in milliseconds

/**
 * Get login attempts data from localStorage
 */
const getLoginAttempts = (identifier: string): LoginAttempt => {
  if (typeof window === 'undefined') return { attempts: 0, lastAttempt: 0 };
  
  try {
    const stored = localStorage.getItem(`${LOGIN_ATTEMPTS_KEY}_${identifier}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to parse login attempts data:', error);
  }
  
  return { attempts: 0, lastAttempt: 0 };
};

/**
 * Save login attempts data to localStorage
 */
const saveLoginAttempts = (identifier: string, data: LoginAttempt): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`${LOGIN_ATTEMPTS_KEY}_${identifier}`, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save login attempts data:', error);
  }
};

/**
 * Calculate lockout duration based on failed attempts
 */
const calculateLockoutDuration = (attempts: number): number => {
  if (attempts < MAX_ATTEMPTS_BEFORE_LOCKOUT) return 0;
  
  // After 10 attempts: 30s, 11th: 60s, 12th: 90s, etc.
  const extraAttempts = attempts - MAX_ATTEMPTS_BEFORE_LOCKOUT + 1;
  return BASE_LOCKOUT_DURATION * extraAttempts;
};

/**
 * Check if user is currently locked out
 */
export const isLockedOut = (identifier: string): { locked: boolean; remainingTime: number } => {
  const attempts = getLoginAttempts(identifier);
  const now = Date.now();
  
  if (attempts.lockoutUntil && attempts.lockoutUntil > now) {
    return {
      locked: true,
      remainingTime: Math.ceil((attempts.lockoutUntil - now) / 1000)
    };
  }
  
  return { locked: false, remainingTime: 0 };
};

/**
 * Record a failed login attempt
 */
export const recordFailedAttempt = (identifier: string): { 
  attempts: number; 
  lockoutDuration: number; 
  isLocked: boolean;
  remainingTime: number;
} => {
  const attempts = getLoginAttempts(identifier);
  const now = Date.now();
  
  // Reset attempts if last attempt was more than 1 hour ago
  const oneHour = 60 * 60 * 1000;
  if (now - attempts.lastAttempt > oneHour) {
    attempts.attempts = 0;
  }
  
  attempts.attempts += 1;
  attempts.lastAttempt = now;
  
  // Calculate lockout if needed
  let lockoutDuration = 0;
  let isLocked = false;
  let remainingTime = 0;
  
  if (attempts.attempts >= MAX_ATTEMPTS_BEFORE_LOCKOUT) {
    lockoutDuration = calculateLockoutDuration(attempts.attempts);
    attempts.lockoutUntil = now + lockoutDuration;
    isLocked = true;
    remainingTime = Math.ceil(lockoutDuration / 1000);
  }
  
  saveLoginAttempts(identifier, attempts);
  
  return {
    attempts: attempts.attempts,
    lockoutDuration: Math.ceil(lockoutDuration / 1000),
    isLocked,
    remainingTime
  };
};

/**
 * Record a successful login (reset attempts)
 */
export const recordSuccessfulLogin = (identifier: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}_${identifier}`);
  } catch (error) {
    console.warn('Failed to clear login attempts data:', error);
  }
};

/**
 * Get current attempt count
 */
export const getAttemptCount = (identifier: string): number => {
  const attempts = getLoginAttempts(identifier);
  return attempts.attempts;
};

/**
 * Format remaining time for display
 */
export const formatRemainingTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} detik`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes} menit`;
  }
  
  return `${minutes} menit ${remainingSeconds} detik`;
};

/**
 * Get lockout message based on attempt count
 */
export const getLockoutMessage = (attempts: number, remainingTime: number): string => {
  const timeStr = formatRemainingTime(remainingTime);
  
  if (attempts === MAX_ATTEMPTS_BEFORE_LOCKOUT) {
    return `Terlalu banyak percobaan login yang gagal. Silakan tunggu ${timeStr} sebelum mencoba lagi.`;
  }
  
  return `Akun Anda terkunci karena ${attempts} kali percobaan login yang gagal. Silakan tunggu ${timeStr} sebelum mencoba lagi.`;
};

/**
 * Sync lockout status across pages
 * This ensures lockout state is maintained when navigating between login and forgot-passcode
 */
export const syncLockoutStatus = (): { 
  isLocked: boolean; 
  remainingTime: number; 
  attempts: number; 
} => {
  const identifier = 'login_attempt';
  const lockoutStatus = isLockedOut(identifier);
  const attempts = getAttemptCount(identifier);
  
  return {
    isLocked: lockoutStatus.locked,
    remainingTime: lockoutStatus.remainingTime,
    attempts
  };
};

/**
 * Update lockout time in real-time
 * Used for countdown timers to keep time synchronized
 */
export const updateLockoutTime = (identifier: string): number => {
  const lockoutStatus = isLockedOut(identifier);
  return lockoutStatus.remainingTime;
};

/**
 * Check if lockout should be cleared (time expired)
 */
export const shouldClearLockout = (identifier: string): boolean => {
  const attempts = getLoginAttempts(identifier);
  const now = Date.now();
  
  if (attempts.lockoutUntil && attempts.lockoutUntil <= now) {
    // Clear expired lockout
    try {
      localStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}_${identifier}`);
      return true;
    } catch (error) {
      console.warn('Failed to clear expired lockout:', error);
    }
  }
  
  return false;
};