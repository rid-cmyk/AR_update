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

// Dynamic role permissions - will be fetched from database
let ROLE_PERMISSIONS: Record<string, { level: number; allowedRoutes: string[]; dashboard: string }> = {};

// Default role permissions (fallback)
const DEFAULT_ROLE_PERMISSIONS: Record<string, { level: number; allowedRoutes: string[]; dashboard: string }> = {
  'super_admin': {
    level: 6,
    allowedRoutes: ['super-admin', 'admin', 'guru', 'santri', 'ortu', 'yayasan', 'users', 'settings', 'notifications', 'super-admin/profil', 'super-admin/users', 'super-admin/notifications', 'profil'],
    dashboard: '/super-admin/dashboard'
  },
  'super-admin': {
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

// Function to get dynamic role permissions
async function getRolePermissions() {
  try {
    // Try to fetch from API (cache for 5 minutes)
    const cacheKey = 'role_permissions_cache';
    const cacheTime = 5 * 60 * 1000; // 5 minutes
    
    // Check if we have cached permissions
    if (ROLE_PERMISSIONS && Object.keys(ROLE_PERMISSIONS).length > 0) {
      return ROLE_PERMISSIONS;
    }

    // For now, use default permissions but make it extensible
    ROLE_PERMISSIONS = { ...DEFAULT_ROLE_PERMISSIONS };
    
    // TODO: Fetch from database when needed
    // const response = await fetch('/api/roles/permissions');
    // if (response.ok) {
    //   const dynamicRoles = await response.json();
    //   // Merge with default permissions
    //   ROLE_PERMISSIONS = { ...DEFAULT_ROLE_PERMISSIONS, ...dynamicRoles };
    // }
    
    return ROLE_PERMISSIONS;
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return DEFAULT_ROLE_PERMISSIONS;
  }
}

// Function to add new role dynamically
function addRolePermission(roleName: string, level: number = 1) {
  // Keep original role name and also create normalized version
  const originalRoleName = roleName.toLowerCase();
  const normalizedRoleName = roleName.toLowerCase().replace(/\s+/g, '_');
  
  const roleConfig = {
    level: level,
    allowedRoutes: [originalRoleName, `${originalRoleName}/profil`],
    dashboard: `/${originalRoleName}/dashboard`
  };
  
  // Add both versions to handle inconsistencies
  ROLE_PERMISSIONS[originalRoleName] = roleConfig;
  if (originalRoleName !== normalizedRoleName) {
    ROLE_PERMISSIONS[normalizedRoleName] = roleConfig;
  }
  
  console.log(`✅ Added dynamic role: ${originalRoleName} (and ${normalizedRoleName}) with level ${level}`);
  return ROLE_PERMISSIONS[originalRoleName];
}

export async function middleware(req: NextRequest) {
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
     // Allow access to login, logout, and forgot-passcode pages
     if (path === "/login" || path === "/logout" || path === "/forgot-passcode") {
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

     // Get dynamic role permissions
     const rolePermissions = await getRolePermissions();
     
     // Validate role exists in our system, if not add it dynamically
     if (!userRole || !rolePermissions[userRole]) {
       if (userRole) {
         console.log('🔄 Adding new role dynamically:', userRole);
         addRolePermission(userRole, 1); // Default level 1 for new roles
         rolePermissions[userRole] = ROLE_PERMISSIONS[userRole];
       } else {
         console.log('❌ Invalid or missing role detected:', userRole);
         return NextResponse.redirect(new URL("/login", req.url));
       }
     }

     // Pass user info to downstream routes
     const requestHeaders = new Headers(req.headers);
     requestHeaders.set("x-user-role", decoded.role);
     requestHeaders.set("x-user-id", userId.toString());
     requestHeaders.set("x-user-name", userName);

     // 4. Handle root path redirection for authenticated users
     if (path === "/") {
       const dashboardPath = rolePermissions[userRole].dashboard;
       console.log('🏠 Redirecting authenticated user to dashboard:', dashboardPath);
       return NextResponse.redirect(new URL(dashboardPath, req.url));
     }

     // 5. Handle login page for authenticated users - redirect to dashboard
     if (path === "/login") {
       const dashboardPath = rolePermissions[userRole].dashboard;
       console.log('🔄 Authenticated user accessing login, redirecting to dashboard:', dashboardPath);
       return NextResponse.redirect(new URL(dashboardPath, req.url));
     }

     // 5.1. Allow logout for authenticated users
     if (path === "/logout") {
       console.log('🚪 Allowing logout access for authenticated user');
       return NextResponse.next({
         request: {
           headers: requestHeaders,
         },
       });
     }

     // 6. Role-based access control
     const userPermissions = rolePermissions[userRole];

     // Check if user has permission to access this route
     const hasAccess = userPermissions.allowedRoutes.some((route: string) => {
       // Check exact match first
       if (path === `/${route}`) return true;
       // Check if path starts with route (for nested routes)
       if (path.startsWith(`/${route}/`)) return true;
       // Check if route contains a slash (for specific sub-routes like 'super-admin/profil')
       if (route.includes('/') && path === `/${route}`) return true;
       return false;
     });

     // Special handling for profil routes
     const isProfilRoute = path.includes('/profil');
     if (isProfilRoute) {
       console.log('🔍 PROFIL ACCESS DEBUG:');
       console.log('- Path:', path);
       console.log('- User Role:', userRole);
       console.log('- Allowed Routes:', userPermissions.allowedRoutes);
       console.log('- Has Access:', hasAccess);
       
       // Force allow profil access for authenticated users to their own role profil
       const userRoleProfilPath = `/${userRole.replace('_', '-')}/profil`;
       if (path === userRoleProfilPath) {
         console.log('✅ PROFIL FORCE ALLOW: User accessing their own profil');
         return NextResponse.next({
           request: {
             headers: requestHeaders,
           },
         });
       }
     }

     // Special handling for super_admin and admin routes (check first before general access)
     let specialRouteHandled = false;
     
     if (path.startsWith("/super-admin")) {
       specialRouteHandled = true;
       console.log('🔍 DEBUG - Checking super-admin access:');
       console.log('- userRole:', `"${userRole}"`);
       console.log('- userRole type:', typeof userRole);
       console.log('- Comparison with "super_admin":', userRole === "super_admin");
       console.log('- Comparison with "super-admin":', userRole === "super-admin");
       
       // Check both formats: super_admin and super-admin
       if (userRole !== "super_admin" && userRole !== "super-admin") {
         console.log('🚫 Super-admin route access denied for role:', userRole);
         return NextResponse.redirect(new URL("/unauthorized", req.url));
       }
       // Super admin has access to super-admin routes, continue
       console.log('✅ Super-admin route access granted for role:', userRole, 'Path:', path);
     } else if (path.startsWith("/admin")) {
       specialRouteHandled = true;
       // Check both formats for consistency
       if (!["super_admin", "super-admin", "admin"].includes(userRole)) {
         console.log('🚫 Admin route access denied for role:', userRole);
         return NextResponse.redirect(new URL("/unauthorized", req.url));
       }
       // Admin or super admin has access to admin routes, continue
       console.log('✅ Admin route access granted for role:', userRole);
     }
     
     // For other routes (not special admin routes), check general permissions
     if (!specialRouteHandled) {
       const isAnalyticsAPI = path.startsWith('/api/analytics');
       if (!hasAccess && !(isAnalyticsAPI && ['super_admin', 'super-admin', 'admin'].includes(userRole))) {
         console.log('🚫 Access denied - User role:', userRole, 'Path:', path);
         return NextResponse.redirect(new URL("/unauthorized", req.url));
       }
     }

     // 7. Allow access with user context
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

