import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route patterns for different access levels
const adminRoutes = [
  "/admin",
  // "/admin/:path*",
];

const facilityOwnerRoutes = [
  "/dashboard/owner",
  "/dashboard/owner/:path*",
  "/owner",
  "/owner/:path*",
  "/api/owner/:path*",
];

const userRoutes = [
  "/dashboard",
  // "/dashboard/bookings",
  // "/dashboard/bookings/:path*",
  // "/dashboard/profile",
  // "/dashboard/profile/:path*",
  // "/dashboard/settings",
  // "/dashboard/settings/:path*",
];

const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/banned",
  "/auth/error",
  "/venues",
  "/venues/:path*",
  "/search",
  "/search/:path*",
  "/api/auth/:path*",
  "/bookings",
];

// Helper function to check if a path matches any pattern
function matchesPattern(path: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, ".*")
      .replace(/:\w+/g, "[^/]+");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  });
}

// Helper function to check if route is public
function isPublicRoute(path: string): boolean {
  return matchesPattern(path, publicRoutes);
}

// Helper function to check if route requires admin access
function isAdminRoute(path: string): boolean {
  return matchesPattern(path, adminRoutes);
}

// Helper function to check if route requires facility owner access
function isFacilityOwnerRoute(path: string): boolean {
  return matchesPattern(path, facilityOwnerRoutes);
}

// Helper function to check if route requires user access
function isUserRoute(path: string): boolean {
  return matchesPattern(path, userRoutes);
}

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const { pathname, searchParams } = req.nextUrl;
    const token = req.nextauth.token;

    // Check for banned user redirect on sign-in page
    if (pathname === '/auth/signin') {
      const callbackUrl = searchParams.get('callbackUrl');

      if (callbackUrl) {
        const decodedCallbackUrl = decodeURIComponent(callbackUrl);
        console.log('🔍 [MIDDLEWARE] Sign-in page with callback:', decodedCallbackUrl);

        // If the callback URL contains banned page or AccessDenied error, redirect directly
        if (decodedCallbackUrl.includes('/auth/banned') ||
          decodedCallbackUrl.includes('error=AccessDenied')) {
          console.log('🔍 [MIDDLEWARE] Redirecting banned user to banned page');
          return NextResponse.redirect(new URL('/auth/banned', req.url));
        }
      }
    }

    // Allow public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // If no token, redirect to sign-in
    if (!token) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const userRole = token.role || "USER" as string;

    // Check admin routes
    if (isAdminRoute(pathname)) {
      if (userRole !== "ADMIN") {
        // Redirect non-admin users to access denied page
        const accessDeniedUrl = new URL("/access-denied", req.url);
        return NextResponse.redirect(accessDeniedUrl);
      }
      return NextResponse.next();
    }

    // Check facility owner routes (accessible by FACILITY_OWNER and ADMIN)
    if (isFacilityOwnerRoute(pathname)) {
      if (userRole !== "FACILITY_OWNER" && userRole !== "ADMIN") {
        const accessDeniedUrl = new URL("/access-denied", req.url);
        return NextResponse.redirect(accessDeniedUrl);
      }
      return NextResponse.next();
    }

    // Check user routes (accessible by USER, FACILITY_OWNER, and ADMIN)
    if (isUserRoute(pathname)) {
      if (!["USER", "FACILITY_OWNER", "ADMIN"].includes(userRole)) {
        const accessDeniedUrl = new URL("/access-denied", req.url);
        return NextResponse.redirect(accessDeniedUrl);
      }
      return NextResponse.next();
    }

    // For any other protected routes, require authentication
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes without token
        if (isPublicRoute(pathname)) {
          return true;
        }

        // Require token for all other routes
        return !!token;
      },
    },
  }
);

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
