/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export function middleware(req: NextRequest) {
   const url = req.nextUrl.clone();
   const path = url.pathname;
   const token = req.cookies.get("auth_token")?.value;

   // 1. Always redirect root path to login
   if (path === "/") {
     return NextResponse.redirect(new URL("/login", req.url));
   }

   // 2. Not logged in → redirect to /login
   if (!token) {
     // Allow access to login page
     if (path === "/login") {
       return NextResponse.next();
     }
     return NextResponse.redirect(new URL("/login", req.url));
   }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const role = decoded.role?.toLowerCase();

    console.log('Middleware - User role from token:', role, 'Path:', path);

    // Pass user info to downstream routes
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-role", decoded.role);
    requestHeaders.set("x-user-name", decoded.namaLengkap);

    // Redirect authenticated users from home page to their dashboards
    if (path === "/") {
      let redirectPath = "/santri/dashboard"; // default

      if (role === "super-admin") {
        redirectPath = "/super-admin/dashboard";
      } else if (role === "admin") {
        redirectPath = "/admin/dashboard";
      } else if (role === "guru") {
        redirectPath = "/guru/dashboard";
      } else if (role === "santri") {
        redirectPath = "/santri/dashboard";
      } else if (role === "orang_tua") {
        redirectPath = "/ortu/dashboard";
      } else if (role === "yayasan") {
        redirectPath = "/yayasan/dashboard";
      }

      console.log('Redirecting user with role:', role, 'to:', redirectPath);
      console.log('Full redirect URL:', new URL(redirectPath, req.url).toString());
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    // 3. Role-based access rules
    if (path.startsWith("/super-admin") || path.startsWith("/users") || path.startsWith("/settings")) {
      if (!["super-admin", "admin"].includes(role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    if (path.startsWith("/admin")) {
      if (!["super-admin", "admin"].includes(role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    if (path.startsWith("/guru") && role !== "guru") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/super-admin") && role !== "super-admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/santri") && role !== "santri") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/ortu") && role !== "orang_tua") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/yayasan") && role !== "yayasan") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // ✅ 4. Allow access
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    console.error("JWT error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// ✅ 5. Match all protected routes
export const config = {
  matcher: [
    // Home page - redirect authenticated users to their dashboards
    "/",

    // Login page - for redirect after login
    "/login",

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

    // Profile
    "/profile",
    "/profile/:path*",

    // Static files
    "/mp3",
    "/mp3/:path*",
  ],
};

