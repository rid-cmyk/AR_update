/**
 * Ar-Hapalan Middleware
 *
 * Handles authentication, authorization, and routing for all user roles:
 * - super-admin: Full system access
 * - guru: Teacher access
 * - santri: Student access
 * - ortu: Parent access
 * - yayasan: Foundation access
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Default role permissions
const DEFAULT_ROLE_PERMISSIONS: Record<string, { level: number; allowedRoutes: string[]; dashboard: string }> = {
  'super_admin': {
    level: 6,
    allowedRoutes: ['super-admin', 'guru', 'santri', 'ortu', 'yayasan', 'users', 'roles', 'settings', 'notifications', 'super-admin/profil', 'super-admin/users', 'super-admin/notifications', 'profil'],
    dashboard: '/super-admin/dashboard'
  },
  'guru': {
    level: 2,
    allowedRoutes: ['guru', 'guru/profil', 'ujian'],
    dashboard: '/guru/dashboard'
  },
  'santri': {
    level: 3,
    allowedRoutes: ['santri', 'santri/profil'],
    dashboard: '/santri/dashboard'
  },
  'ortu': {
    level: 2,
    allowedRoutes: ['ortu', 'ortu/profil'],
    dashboard: '/ortu/dashboard'
  },
  'yayasan': {
    level: 1,
    allowedRoutes: ['yayasan', 'yayasan/dashboard', 'yayasan/laporan', 'yayasan/santri', 'yayasan/raport', 'yayasan/notifikasi', 'yayasan/profil', 'users', 'profile'],
    dashboard: '/yayasan/dashboard'
  }
};

// Rate limiting cache (In-memory, works well for single instances and edge isolates)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || (now - record.timestamp > windowMs)) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return { allowed: true, remaining: limit - 1, resetSeconds: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.max(1, Math.ceil((record.timestamp + windowMs - now) / 1000)),
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetSeconds: Math.max(1, Math.ceil((record.timestamp + windowMs - now) / 1000)),
  };
}

export function rateLimitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + result.resetSeconds),
  };
  if (!result.allowed) {
    headers["Retry-After"] = String(result.resetSeconds);
  }
  return headers;
}

// Verify JWT signature using Web Crypto API (Edge Runtime compatible)
export async function verifyJWT(token: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(`${headerB64}.${payloadB64}`)
    );

    if (!valid) return null;

    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);

    // Cek masa berlaku token (exp) — token kedaluwarsa ditolak di middleware
    const exp = decoded?.exp;
    if (typeof exp === 'number' && Date.now() / 1000 > exp) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.clone();
  const path = url.pathname;
  const token = req.cookies.get("auth_token")?.value;
  // Jangan percaya client-supplied x-forwarded-for: ambil entri PALING KANAN dalam rantai
  // (ditambahkan proxy/Vercel dari koneksi asli) agar IP tidak bisa di-spoof untuk bypass rate limit.
  const forwardedFor = (req.headers.get("x-forwarded-for") || "").split(",").map(p => p.trim()).filter(Boolean);
  const ip = forwardedFor.length > 0 ? forwardedFor[forwardedFor.length - 1] : (req.headers.get("x-real-ip") || "unknown");

  // 0. Apply Rate Limiting
  if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/forgot-passcode")) {
    const rl = checkRateLimit(ip + "-auth", 5, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too Many Requests", code: "rate_limit_exceeded", message: "Batas percobaan terlampaui. Silakan coba lagi nanti." },
        { status: 429, headers: rateLimitHeaders(rl, 5) }
      );
    }
  } else if (path.startsWith("/api/")) {
    const rl = checkRateLimit(ip + "-api", 100, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too Many Requests", code: "rate_limit_exceeded", message: "Terlalu banyak request. Silakan perlambat aktivitas Anda." },
        { status: 429, headers: rateLimitHeaders(rl, 100) }
      );
    }
  }

  // 1. Always redirect root path to login (unless authenticated)
  if (path === "/" || path === "/m" || path === "/m/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 2. Handle unauthenticated users
  if (!token) {
    if (path === "/login" || path === "/logout" || path === "/unauthorized" || path === "/forgot-passcode" || path === "/m/offline") {
      return NextResponse.next();
    }

    if (
      path.startsWith("/api/auth") ||
      path.startsWith("/api/mushaf") ||
      path.startsWith("/api/quran") ||
      path.startsWith("/api/inngest") ||
      path.startsWith("/api/cron") ||
      path.startsWith("/api/forgot-passcode") ||
      path.startsWith("/api/health")
    ) {
      return NextResponse.next();
    }

    if (path.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized", message: "Token missing or invalid" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Decode JWT and extract user info
  const decoded = await verifyJWT(token);
  if (!decoded) {
    console.error("❌ JWT verification failed — invalid signature or expired");

    if (path.startsWith("/api/")) {
      const response = NextResponse.json({ success: false, error: "Unauthorized", message: "Invalid or expired token" }, { status: 401 });
      response.cookies.set("auth_token", "", { expires: new Date(0) });
      return response;
    }

    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("auth_token", "", { expires: new Date(0) });
    return response;
  }

  const userRole = (decoded.role as string)?.toLowerCase();
  const userId = decoded.id as string | number;
  const userName = decoded.namaLengkap as string;

  let normalizedRole = userRole?.replace(/-/g, '_');
  if (normalizedRole === 'superadmin') normalizedRole = 'super_admin';

  if (!normalizedRole || !DEFAULT_ROLE_PERMISSIONS[normalizedRole]) {
    console.error('❌ Invalid or missing role detected:', userRole);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const effectiveRole = normalizedRole;

  // Detect mobile device from User-Agent
  const userAgent = req.headers.get("user-agent") || "";
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-role", effectiveRole);
  requestHeaders.set("x-user-id", userId.toString());
  requestHeaders.set("x-user-name", userName);
  requestHeaders.set("x-is-mobile", isMobile ? "true" : "false");

  const forceDesktopParam = req.nextUrl.searchParams.get("desktop") === "true";
  const forceMobileParam = req.nextUrl.searchParams.get("mobile") === "true";
  const hasForceDesktopCookie = req.cookies.get("force_desktop")?.value === "true";
  const isForceDesktop = (forceDesktopParam || hasForceDesktopCookie) && !forceMobileParam;

  if (forceMobileParam || (path.startsWith("/m/") && hasForceDesktopCookie)) {
    const targetUrl = new URL(req.url);
    targetUrl.searchParams.delete("mobile");
    const res = NextResponse.redirect(targetUrl);
    res.cookies.set("force_desktop", "false", { path: "/", maxAge: 0 });
    return res;
  }

  // 4. Handle root path redirection for authenticated users
  if (path === "/" || path === "/m" || path === "/m/") {
    const dashboardPath = DEFAULT_ROLE_PERMISSIONS[effectiveRole].dashboard;
    const targetPath = (isMobile && !isForceDesktop) || path.startsWith("/m") ? `/m${dashboardPath}` : dashboardPath;
    const res = NextResponse.redirect(new URL(targetPath, req.url));
    if (forceDesktopParam) {
      res.cookies.set("force_desktop", "true", { path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    return res;
  }

  // 5. Handle login page for authenticated users
  if (path === "/login") {
    const dashboardPath = DEFAULT_ROLE_PERMISSIONS[effectiveRole].dashboard;
    const targetPath = isMobile && !isForceDesktop ? `/m${dashboardPath}` : dashboardPath;
    const res = NextResponse.redirect(new URL(targetPath, req.url));
    if (forceDesktopParam) {
      res.cookies.set("force_desktop", "true", { path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    return res;
  }

  // 5.0. Auto redirect mobile users from desktop routes to /m/ prefix
  if (isMobile && !isForceDesktop && !path.startsWith("/m/") && !path.startsWith("/api/")) {
    const desktopPrefixes = ["/guru", "/santri", "/ortu", "/yayasan", "/super-admin"];
    if (desktopPrefixes.some(p => path === p || path.startsWith(`${p}/`))) {
      return NextResponse.redirect(new URL(`/m${path}`, req.url));
    }
  }

  if (forceDesktopParam) {
    const res = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    res.cookies.set("force_desktop", "true", { path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  // 5.1. Allow logout for authenticated users
  if (path === "/logout" || path === "/api/auth/logout") {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 5.1b. Public health check (liveness probe)
  if (path === "/api/health" || path.startsWith("/api/health/")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 5.2. Allow auth verification, profile, analytics, users, notifications, and admin APIs
  if (
    path.startsWith("/api/auth") ||
    path === "/api/profile" ||
    path.startsWith("/api/analytics") ||
    path.startsWith("/api/users") ||
    path.startsWith("/api/notifikasi") ||
    path.startsWith("/api/notifications") ||
    path.startsWith("/api/super-admin") ||
    path.startsWith("/api/database") ||
    path.startsWith("/api/test-db") ||
    path.startsWith("/api/target") ||
    path.startsWith("/api/roles") ||
    path.startsWith("/api/pengumuman") ||
    path.startsWith("/api/halaqah") ||
    path.startsWith("/api/jadwal") ||
    path.startsWith("/api/raport") ||
    path.startsWith("/api/hafalan") ||
    path.startsWith("/api/upload") ||
    path.startsWith("/api/konversi") ||
    path.startsWith("/api/forgot-passcode")
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Normalize /m prefix so mobile routes like /m/guru/dashboard are checked as /guru/dashboard
  const rbacPath = path.startsWith("/m/") ? path.replace(/^\/m/, "") || "/" : path;

  // 6. Role-based access control
  const userPermissions = DEFAULT_ROLE_PERMISSIONS[effectiveRole];

  const hasAccess = userPermissions.allowedRoutes.some((route: string) => {
    if (rbacPath === `/${route}`) return true;
    if (rbacPath.startsWith(`/${route}/`)) return true;
    if (rbacPath === `/api/${route}`) return true;
    if (rbacPath.startsWith(`/api/${route}/`)) return true;
    if (route.includes('/') && rbacPath === `/${route}`) return true;
    return false;
  });

  const isProfilRoute = rbacPath.includes('/profil');
  if (isProfilRoute) {
    const userRoleProfilPath = `/${effectiveRole.replace('_', '-')}/profil`;
    if (rbacPath === userRoleProfilPath) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  if (!hasAccess) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: "Forbidden", message: "Insufficient role permissions" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // 7. Allow access with user context
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Match all protected routes
export const config = {
  matcher: [
    "/",
    "/login",
    "/logout",
    "/unauthorized",
    "/dashboard",
    "/dashboard/:path*",
    "/super-admin",
    "/super-admin/:path*",
    "/guru",
    "/guru/:path*",
    "/santri",
    "/santri/:path*",
    "/ortu",
    "/ortu/:path*",
    "/yayasan",
    "/yayasan/:path*",
    "/api/:path*",
    "/super-admin/profil",
    "/guru/profil",
    "/santri/profil",
    "/ortu/profil",
    "/yayasan/profil",
    "/profile",
    "/profile/:path*",
    "/m",
    "/m/:path*",
  ],
};