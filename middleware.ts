/* eslint-disable @typescript-eslint/no-explicit-any */
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
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// Role hierarchy and permissions
const ROLE_PERMISSIONS: Record<string, { level: number; allowedRoutes: string[]; dashboard: string }> = {
  'super-admin': {
    level: 6,
    allowedRoutes: ['super-admin', 'admin', 'guru', 'santri', 'ortu', 'yayasan', 'users', 'settings', 'super-admin/profil'],
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
  'orang_tua': {
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

export function middleware(req: NextRequest) {
   const url = req.nextUrl.clone();
   const path = url.pathname;
   const token = req.cookies.get("auth_token")?.value;

   console.log('🔍 Middleware Check - Path:', path, 'Token:', token ? 'Present' : 'None');

   // 1. Always redirect root path to login (unless authenticated)
   if (path === "/") {
     if (!token) {
       console.log('🏠 Root path - No token, redirecting to login');
       return NextResponse.redirect(new URL("/login", req.url));
     }
     // If authenticated, continue to role-based redirection below
   }

   // 2. Handle unauthenticated users
   if (!token) {
     // Allow access to login and logout pages
     if (path === "/login" || path === "/logout") {
       console.log('✅ Allowing access to auth pages');
       return NextResponse.next();
     }

     // Redirect all other requests to login
     console.log('🚫 No token found, redirecting to login');
     return NextResponse.redirect(new URL("/login", req.url));
   }

   // 3. Verify JWT and extract user info
   try {
     const decoded = jwt.verify(token, JWT_SECRET) as any;
     const userRole = decoded.role?.toLowerCase();
     const userId = decoded.id;
     const userName = decoded.namaLengkap;

     console.log('👤 User authenticated - Role:', userRole, 'ID:', userId, 'Name:', userName);

     // Validate role exists in our system
     if (!userRole || !ROLE_PERMISSIONS[userRole]) {
       console.log('❌ Invalid or missing role detected:', userRole);
       return NextResponse.redirect(new URL("/login", req.url));
     }

     // Pass user info to downstream routes
     const requestHeaders = new Headers(req.headers);
     requestHeaders.set("x-user-role", decoded.role);
     requestHeaders.set("x-user-id", userId.toString());
     requestHeaders.set("x-user-name", userName);

     // 4. Handle root path redirection for authenticated users
     if (path === "/") {
       const dashboardPath = ROLE_PERMISSIONS[userRole].dashboard;
       console.log('🏠 Redirecting authenticated user to dashboard:', dashboardPath);
       return NextResponse.redirect(new URL(dashboardPath, req.url));
     }

     // 5. Role-based access control
     const userPermissions = ROLE_PERMISSIONS[userRole];

     // Check if user has permission to access this route
     const hasAccess = userPermissions.allowedRoutes.some((route: string) => {
       // Check exact match first
       if (path === `/${route}`) return true;
       // Check if path starts with route (for nested routes)
       if (path.startsWith(`/${route}`)) return true;
       // Check if route contains a slash (for specific sub-routes like 'ortu/profil')
       if (route.includes('/') && path === `/${route}`) return true;
       return false;
     });

     // Allow API analytics access for super-admin and admin
     const isAnalyticsAPI = path.startsWith('/api/analytics');
     if (!hasAccess && !(isAnalyticsAPI && ['super-admin', 'admin'].includes(userRole))) {
       console.log('🚫 Access denied - User role:', userRole, 'Path:', path);
       return NextResponse.redirect(new URL("/unauthorized", req.url));
     }

     // Special handling for super-admin and admin routes
     if (path.startsWith("/super-admin") && userRole !== "super-admin") {
       console.log('🚫 Super-admin route access denied for role:', userRole);
       return NextResponse.redirect(new URL("/unauthorized", req.url));
     }

     if (path.startsWith("/admin") && !["super-admin", "admin"].includes(userRole)) {
       console.log('🚫 Admin route access denied for role:', userRole);
       return NextResponse.redirect(new URL("/unauthorized", req.url));
     }

     // 6. Allow access with user context
     console.log('✅ Access granted - Role:', userRole, 'Path:', path);
     return NextResponse.next({
       request: {
         headers: requestHeaders,
       },
     });

   } catch (err) {
     console.error("❌ JWT verification failed:", err);
     // Clear invalid token
     const response = NextResponse.redirect(new URL("/login", req.url));
     response.cookies.set("auth_token", "", { expires: new Date(0) });
     return response;
   }
}

// ✅ 5. Match all protected routes
export const config = {
  matcher: [
    // Home page - redirect authenticated users to their dashboards
    "/",

    // Login page - for redirect after login
    "/login",

    // Logout page - for logout functionality
    "/logout",

    // Dashboard
    "/dashboard",
    "/dashboard/:path*",

    // Super Admin
    "/super-admin",
    "/super-admin/:path*",

    // Users (Super Admin only)
    "/users",
    "/users/:path*",

    // Settings (Super Admin only)
    "/settings",
    "/settings/:path*",

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

    // Analytics API
    "/api/analytics",
    "/api/analytics/:path*",

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

