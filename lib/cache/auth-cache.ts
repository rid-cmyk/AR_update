export interface AuthUser {
  id: string;
  email: string;
  role: string;
  namaLengkap: string;
  yayasanId?: string;
  [key: string]: any;
}

const authCache = new Map<string, { user: AuthUser; exp: number }>()

export function getCachedAuth(token: string) {
  const entry = authCache.get(token)
  if (entry && entry.exp > Date.now()) return entry.user
  authCache.delete(token)
  return null
}

export function setCachedAuth(token: string, user: AuthUser) {
  authCache.set(token, { user, exp: Date.now() + 60_000 })
}
