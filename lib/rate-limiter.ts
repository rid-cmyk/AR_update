import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

// Clean up expired IP entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, store] of rateLimitMap.entries()) {
    if (store.resetTime <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 2 * 60 * 1000);

export interface RateLimitOptions {
  limit?: number;       // Max allowed requests in window
  windowMs?: number;    // Window duration in ms
}

/**
 * In-Memory Sliding Window Rate Limiter for Next.js App Router API Routes
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; response?: NextResponse } {
  const limit = options.limit || 60; // 60 requests
  const windowMs = options.windowMs || 60 * 1000; // 1 minute window

  // Determine client identifier (IP or auth header)
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
  const path = req.nextUrl.pathname;
  const key = `${ip}:${path}`;

  const now = Date.now();
  const store = rateLimitMap.get(key);

  if (!store || store.resetTime <= now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (store.count >= limit) {
    const retryAfter = Math.ceil((store.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      response: NextResponse.json(
        { error: "Too many requests. Please try again later.", retryAfterSeconds: retryAfter },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      ),
    };
  }

  store.count += 1;
  return { allowed: true, remaining: limit - store.count };
}
