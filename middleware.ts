/**
 * Ar-Hapalan Middleware
 *
 * Handles authentication, authorization, and routing for all user roles:
 * - super-admin: Full system access
 * - admin: Administrative access
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
    allowedRoutes: ['super-admin', 'admin', 'guru', 'santri', 'ortu', 'yayasan', 'users', 'roles', 'settings', 'notifications', 'super-admin/profil', 'super-admin/users', 'super-admin/notifications', 'profil'],
    dashboard: '/super-admin/dashboard'
  },
  'admin': {
    level: 5,
    allowedRoutes: ['admin', 'guru', 'santri', 'ortu', 'yayasan', 'users', 'roles', 'admin/profil'],
    dashboard: '/admin/dashboard'
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

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || (now - record.timestamp > windowMs)) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// Verify JWT signature using Web Crypto API (Edge Runtime compatible)
async function verifyJWT(token: string): Promise<Record<string, unknown> | null> {
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

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.clone();
  const path = url.pathname;
  const token = req.cookies.get("auth_token")?.value;
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // 0. Apply Rate Limiting
  if (path.startsWith("/api/login") || path.startsWith("/api/auth/forgot-passcode")) {
    if (!checkRateLimit(ip + "-auth", 5, 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Too Many Requests", message: "Batas percobaan terlampaui. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }
  } else if (path.startsWith("/api/")) {
    if (!checkRateLimit(ip + "-api", 100, 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Too Many Requests", message: "Terlalu banyak request. Silakan perlambat aktivitas Anda." },
        { status: 429 }
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
      path.startsWith("/api/login") ||
      path.startsWith("/api/mushaf") ||
      path.startsWith("/api/quran") ||
      path.startsWith("/api/inngest") ||
      path.startsWith("/api/cron")
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
    const desktopPrefixes = ["/guru", "/admin", "/santri", "/ortu", "/yayasan", "/super-admin"];
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
  if (path === "/logout" || path === "/api/logout") {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 5.2. Allow auth verification, profile, analytics, users, notifications, and shared admin APIs
  if (
    path.startsWith("/api/auth") ||
    path === "/api/profile" ||
    path.startsWith("/api/analytics") ||
    path.startsWith("/api/users") ||
    path.startsWith("/api/notifikasi") ||
    path.startsWith("/api/admin/jenis-ujian") ||
    path.startsWith("/api/admin/template-ujian") ||
    path.startsWith("/api/database") ||
    path.startsWith("/api/test-db") ||
    path.startsWith("/api/admin-settings") ||
    path.startsWith("/api/target") ||
    path.startsWith("/api/roles")
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

  // Special handling for super_admin and admin routes
  let specialRouteHandled = false;

  if (rbacPath.startsWith("/super-admin") || rbacPath.startsWith("/api/super-admin")) {
    specialRouteHandled = true;
    if (effectiveRole !== "super_admin") {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Forbidden", message: "Insufficient role permissions" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  } else if (rbacPath.startsWith("/admin") || rbacPath.startsWith("/api/admin")) {
    specialRouteHandled = true;
    if (!["super_admin", "admin"].includes(effectiveRole)) {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Forbidden", message: "Insufficient role permissions" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  if (!specialRouteHandled) {
    if (!hasAccess) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: "Forbidden", message: "Insufficient role permissions" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
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
    "/admin",
    "/admin/:path*",
    "/admin/pengumuman",
    "/admin/pengumuman/:path*",
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
    "/admin/profil",
    "/guru/profil",
    "/santri/profil",
    "/ortu/profil",
    "/yayasan/profil",
    "/profile",
    "/profile/:path*",
    "/mp3",
    "/mp3/:path*",
    "/m",
    "/m/:path*",
  ],
};