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
    allowedRoutes: ['super-admin', 'admin', 'guru', 'santri', 'ortu', 'yayasan', 'users', 'settings', 'notifications', 'super-admin/profil', 'super-admin/users', 'super-admin/notifications', 'profil'],
    dashboard: '/super-admin/dashboard'
  },
  'admin': {
    level: 5,
    allowedRoutes: ['admin', 'guru', 'santri', 'ortu', 'yayasan', 'admin/profil'],
    dashboard: '/admin/dashboard'
  },
  'guru': {
    level: 4,
    allowedRoutes: ['guru', 'guru/profil'],
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
    allowedRoutes: ['yayasan', 'yayasan/profil'],
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
   const ip =  req.headers.get("x-forwarded-for") || "unknown";

   // 0. Apply Rate Limiting
   if (path.startsWith("/api/login") || path.startsWith("/api/auth/forgot-passcode")) {
     // Max 5 requests per minute for sensitive auth endpoints
     if (!checkRateLimit(ip + "-auth", 5, 60 * 1000)) {
       return NextResponse.json(
         { success: false, error: "Too Many Requests", message: "Batas percobaan terlampaui. Silakan coba lagi nanti." },
         { status: 429 }
       );
     }
   } else if (path.startsWith("/api/")) {
     // Max 100 requests per minute for general API endpoints
     if (!checkRateLimit(ip + "-api", 100, 60 * 1000)) {
       return NextResponse.json(
         { success: false, error: "Too Many Requests", message: "Terlalu banyak request. Silakan perlambat aktivitas Anda." },
         { status: 429 }
       );
     }
   }

   // 1. Always redirect root path to login (unless authenticated)
   if (path === "/") {
     if (!token) {
       return NextResponse.redirect(new URL("/login", req.url));
     }
     // If authenticated, continue to role-based redirection below
   }

   // 2. Handle unauthenticated users
   if (!token) {
     if (path === "/login" || path === "/logout" || path === "/unauthorized" || path === "/forgot-passcode") {
       return NextResponse.next();
     }

     // Public API routes
     if (path.startsWith("/api/auth") || path.startsWith("/api/login") || path.startsWith("/api/mushaf") || path.startsWith("/api/quran")) {
       return NextResponse.next();
     }

     if (path.startsWith("/api/")) {
       return NextResponse.json({ success: false, error: "Unauthorized", message: "Token missing or invalid" }, { status: 401 });
     }

     // Redirect all other requests to login
     return NextResponse.redirect(new URL("/login", req.url));
   }

   // 3. Decode JWT and extract user info (simplified for Edge Runtime compatibility)
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

  // Normalize role: convert dash to underscore, and map common variations
  let normalizedRole = userRole?.replace(/-/g, '_');
  if (normalizedRole === 'superadmin') normalizedRole = 'super_admin';

   // Validate role exists in our system
   if (!normalizedRole || !DEFAULT_ROLE_PERMISSIONS[normalizedRole]) {
     console.error('❌ Invalid or missing role detected:', userRole);
     return NextResponse.redirect(new URL("/login", req.url));
   }

   // Use normalized role for permissions
   const effectiveRole = normalizedRole;

   // Pass user info to downstream routes
   const requestHeaders = new Headers(req.headers);
   requestHeaders.set("x-user-role", userRole);
   requestHeaders.set("x-user-id", userId.toString());
   requestHeaders.set("x-user-name", userName);

   // 4. Handle root path redirection for authenticated users
   if (path === "/") {
     const dashboardPath = DEFAULT_ROLE_PERMISSIONS[effectiveRole].dashboard;
     return NextResponse.redirect(new URL(dashboardPath, req.url));
   }

   // 5. Handle login page for authenticated users - redirect to dashboard
   if (path === "/login") {
     const dashboardPath = DEFAULT_ROLE_PERMISSIONS[effectiveRole].dashboard;
     return NextResponse.redirect(new URL(dashboardPath, req.url));
   }

   // 5.1. Allow logout for authenticated users
   if (path === "/logout") {
     return NextResponse.next({
       request: {
         headers: requestHeaders,
       },
     });
   }

   // 6. Role-based access control
   const userPermissions = DEFAULT_ROLE_PERMISSIONS[effectiveRole];

   // Check if user has permission to access this route
   const hasAccess = userPermissions.allowedRoutes.some((route: string) => {
     // Check exact match first
     if (path === `/${route}`) return true;
     // Check if path starts with route (for nested routes)
     if (path.startsWith(`/${route}/`)) return true;
     
     // Check API routes match (e.g. /api/guru, /api/admin)
     if (path === `/api/${route}`) return true;
     if (path.startsWith(`/api/${route}/`)) return true;
     
     // Check if route contains a slash (for specific sub-routes like 'super-admin/profil')
     if (route.includes('/') && path === `/${route}`) return true;
     return false;
   });

   // Special handling for profil routes
   const isProfilRoute = path.includes('/profil');
   if (isProfilRoute) {
     // Force allow profil access for authenticated users to their own role profil
     const userRoleProfilPath = `/${effectiveRole.replace('_', '-')}/profil`;
     if (path === userRoleProfilPath) {
       return NextResponse.next({
         request: {
           headers: requestHeaders,
         },
       });
     }
   }

   // Special handling for super_admin and admin routes
   let specialRouteHandled = false;
   
   if (path.startsWith("/super-admin") || path.startsWith("/api/super-admin")) {
     specialRouteHandled = true;
     if (effectiveRole !== "super_admin") {
       if (path.startsWith("/api/")) return NextResponse.json({ success: false, error: "Forbidden", message: "Insufficient role permissions" }, { status: 403 });
       return NextResponse.redirect(new URL("/unauthorized", req.url));
     }
   } else if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
     specialRouteHandled = true;
     if (!["super_admin", "admin"].includes(effectiveRole)) {
       if (path.startsWith("/api/")) return NextResponse.json({ success: false, error: "Forbidden", message: "Insufficient role permissions" }, { status: 403 });
       return NextResponse.redirect(new URL("/unauthorized", req.url));
     }
   }
   
   // For other routes (not special admin routes), check general permissions
   // API routes handle their own auth — only block page routes
   if (!specialRouteHandled && !path.startsWith('/api/')) {
     if (!hasAccess) {
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
    // Home page - redirect authenticated users to their dashboards
    "/",

    // Login page - for redirect after login
    "/login",

    // Logout page - for logout functionality
    "/logout",

    // Unauthorized page - for access denied
    "/unauthorized",

    // Dashboard
    "/dashboard",
    "/dashboard/:path*",

    // Super Admin
    "/super-admin",
    "/super-admin/:path*",

    // Admin
    "/admin",
    "/admin/:path*",

    // Announcement Management (admin/guru)
    "/admin/pengumuman",
    "/admin/pengumuman/:path*",

    // Guru
    "/guru",
    "/guru/:path*",

    // Santri
    "/santri",
    "/santri/:path*",

    // Orang Tua
    "/ortu",
    "/ortu/:path*",

    // Yayasan
    "/yayasan",
    "/yayasan/:path*",

    // API routes
    "/api/:path*",

    // Profile pages for all roles
    "/super-admin/profil",
    "/admin/profil",
    "/guru/profil",
    "/santri/profil",
    "/ortu/profil",
    "/yayasan/profil",
    "/profile",
    "/profile/:path*",

    // Static files
    "/mp3",
    "/mp3/:path*",
  ],
};