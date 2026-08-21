"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  syncLockoutStatus, 
  updateLockoutTime, 
  shouldClearLockout,
  formatRemainingTime,
  getLockoutMessage
} from '@/lib/utils/rateLimiter';

interface LockoutStatus {
  isLocked: boolean;
  remainingTime: number;
  attempts: number;
  message: string;
  formattedTime: string;
}

export const useLockoutStatus = () => {
  const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus>({
    isLocked: false,
    remainingTime: 0,
    attempts: 0,
    message: '',
    formattedTime: ''
  });

  const updateStatus = useCallback(() => {
    const identifier = 'login_attempt';
    
    // Check if lockout should be cleared first
    if (shouldClearLockout(identifier)) {
      setLockoutStatus({
        isLocked: false,
        remainingTime: 0,
        attempts: 0,
        message: '',
        formattedTime: ''
      });
      return;
    }

    // Get current status
    const status = syncLockoutStatus();
    
    setLockoutStatus({
      isLocked: status.isLocked,
      remainingTime: status.remainingTime,
      attempts: status.attempts,
      message: status.isLocked ? getLockoutMessage(status.attempts, status.remainingTime) : '',
      formattedTime: status.isLocked ? formatRemainingTime(status.remainingTime) : ''
    });
  }, []);

  // Initialize status on mount
  useEffect(() => {
    updateStatus();
  }, [updateStatus]);

  // Update status every second when locked
  useEffect(() => {
    if (!lockoutStatus.isLocked) return;

    const interval = setInterval(() => {
      const identifier = 'login_attempt';
      const newRemainingTime = updateLockoutTime(identifier);
      
      if (newRemainingTime <= 0) {
        // Lockout expired
        updateStatus();
      } else {
        // Update remaining time
        setLockoutStatus(prev => ({
          ...prev,
          remainingTime: newRemainingTime,
          formattedTime: formatRemainingTime(newRemainingTime),
          message: getLockoutMessage(prev.attempts, newRemainingTime)
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutStatus.isLocked, updateStatus]);

  // Listen for storage changes (when user switches tabs/pages)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('login_attempts')) {
        updateStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateStatus]);

  // Listen for visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateStatus]);

  return {
    ...lockoutStatus,
    refreshStatus: updateStatus
  };
};