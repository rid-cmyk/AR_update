export interface AuthUser {
  id: string;
  email: string;
  role: string;
  namaLengkap: string;
  yayasanId?: string;
  [key: string]: any;
}

const authCache = new Map<string, { user: AuthUser; exp: number }>()

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [token, entry] of authCache) {
    if (entry.exp <= now) {
      authCache.delete(token);
    }
  }
}

// Run cleanup periodically
setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);

export function getCachedAuth(token: string) {
  const entry = authCache.get(token)
  if (entry && entry.exp > Date.now()) return entry.user
  authCache.delete(token)
  return null
}

export function setCachedAuth(token: string, user: AuthUser) {
  authCache.set(token, { user, exp: Date.now() + 60_000 })
}
