import { NextResponse } from "next/server";

interface CacheEntry<T> {
  data: T;
  exp: number;
}

// In-Memory LRU/TTL Cache Map
const apiCache = new Map<string, CacheEntry<any>>();
// Map of pending promises to prevent dog-pile queries during cache miss
const pendingFetches = new Map<string, Promise<any>>();

const MAX_CACHE_KEYS = 500;
const CLEANUP_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Periodically removes expired cache entries and enforces LRU limit
 */
function cleanupApiCache() {
  const now = Date.now();
  for (const [key, entry] of apiCache.entries()) {
    if (entry.exp <= now) {
      apiCache.delete(key);
    }
  }

  // LRU Eviction if over MAX_CACHE_KEYS
  if (apiCache.size > MAX_CACHE_KEYS) {
    const keysToDelete = Array.from(apiCache.keys()).slice(0, apiCache.size - MAX_CACHE_KEYS);
    for (const key of keysToDelete) {
      apiCache.delete(key);
    }
  }
}

// Ensure cleanup runs periodically in server environment
if (typeof setInterval !== "undefined") {
  setInterval(cleanupApiCache, CLEANUP_INTERVAL_MS);
}

/**
 * Executes a read-heavy query with In-Memory TTL caching and dog-pile prevention.
 *
 * @param key Unique string cache key (e.g. "admin:dashboard-stats:1")
 * @param ttlMs Time-to-live in milliseconds (e.g. 120_000 for 2 minutes)
 * @param fetcher Async function that queries the database
 */
export async function withApiCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = apiCache.get(key);

  if (cached && cached.exp > now) {
    return cached.data as T;
  }

  // If a fetch is already in flight for this key, await it to avoid duplicate DB queries
  if (pendingFetches.has(key)) {
    return pendingFetches.get(key) as Promise<T>;
  }

  const fetchPromise = (async () => {
    try {
      const data = await fetcher();
      apiCache.set(key, {
        data,
        exp: Date.now() + ttlMs,
      });
      return data;
    } finally {
      pendingFetches.delete(key);
    }
  })();

  pendingFetches.set(key, fetchPromise);
  return fetchPromise;
}

/**
 * Invalidates cache keys matching an optional prefix, or clears all keys if prefix is omitted.
 */
export function invalidateApiCache(prefix?: string): void {
  if (!prefix) {
    apiCache.clear();
    return;
  }

  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) {
      apiCache.delete(key);
    }
  }
}

/**
 * Returns a NextResponse formatted as JSON with HTTP Edge/Browser caching headers.
 */
export function cachedJsonResponse(
  data: unknown,
  status = 200,
  maxAge = 60,
  staleWhileRevalidate = 300
): NextResponse {
  const res = NextResponse.json(data, { status });
  res.headers.set(
    "Cache-Control",
    `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );
  return res;
}
