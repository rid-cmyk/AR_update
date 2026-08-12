/**
 * Server-side cooldown untuk endpoint forgot-passcode (anti-spam per nomor/IP).
 *
 * Aturan (sesuai kebutuhan):
 * - 10 percobaan pertama bebas (tanpa lockout).
 * - Setelah itu, setiap percobaan berikutnya menambah 1 menit waktu tunggu.
 * - Percobaan direset jika jeda dari percobaan terakhir > 1 jam.
 */

interface CooldownEntry {
  attempts: number;
  lastAttempt: number;
  lockoutUntil?: number;
}

const MAX_FREE_ATTEMPTS = 10;
const LOCKOUT_PER_EXTRA_ATTEMPT_MS = 60 * 1000; // 1 menit per percobaan ekstra
const RESET_WINDOW_MS = 60 * 60 * 1000; // 1 jam tanpa aktivitas → reset

const cooldownMap = new Map<string, CooldownEntry>();

const getEntry = (key: string): CooldownEntry => {
  const entry = cooldownMap.get(key);
  if (!entry) {
    const fresh: CooldownEntry = { attempts: 0, lastAttempt: 0 };
    cooldownMap.set(key, fresh);
    return fresh;
  }
  return entry;
};

const isExpiredLockout = (entry: CooldownEntry): boolean =>
  !!entry.lockoutUntil && entry.lockoutUntil <= Date.now();

const shouldResetWindow = (entry: CooldownEntry): boolean =>
  Date.now() - entry.lastAttempt > RESET_WINDOW_MS;

const remainingMs = (entry: CooldownEntry): number =>
  entry.lockoutUntil ? Math.max(0, entry.lockoutUntil - Date.now()) : 0;

export interface ForgotCooldownStatus {
  locked: boolean;
  remainingMs: number;
  attempts: number;
}

export function checkForgotPasscodeCooldown(key: string): ForgotCooldownStatus {
  const entry = getEntry(key);
  if (shouldResetWindow(entry) || isExpiredLockout(entry)) {
    return { locked: false, remainingMs: 0, attempts: entry.attempts };
  }
  return { locked: !!entry.lockoutUntil, remainingMs: remainingMs(entry), attempts: entry.attempts };
}

export interface ForgotCooldownResult extends ForgotCooldownStatus {
  lockoutMs: number;
}

export function recordForgotPasscodeAttempt(key: string): ForgotCooldownResult {
  const entry = getEntry(key);
  const now = Date.now();

  if (shouldResetWindow(entry)) {
    entry.attempts = 0;
    entry.lockoutUntil = undefined;
  }

  entry.attempts += 1;
  entry.lastAttempt = now;

  let lockoutMs = 0;
  if (entry.attempts > MAX_FREE_ATTEMPTS) {
    lockoutMs = (entry.attempts - MAX_FREE_ATTEMPTS) * LOCKOUT_PER_EXTRA_ATTEMPT_MS;
    entry.lockoutUntil = now + lockoutMs;
  }

  return {
    locked: entry.attempts > MAX_FREE_ATTEMPTS,
    remainingMs: lockoutMs,
    lockoutMs,
    attempts: entry.attempts,
  };
}

export function resetForgotPasscodeAttempts(key: string): void {
  const entry = getEntry(key);
  entry.attempts = 0;
  entry.lastAttempt = 0;
  entry.lockoutUntil = undefined;
}
