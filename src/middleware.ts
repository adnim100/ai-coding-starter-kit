import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Define protected routes
const PROTECTED_ROUTES = [
  "/dashboard",
  "/projects",
  "/settings",
  "/api/projects",
  "/api/transcription",
  "/api/audio",
  "/api/api-keys",
];

// Define public routes that should redirect to dashboard if authenticated
const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
];

// Define routes that are always public
const PUBLIC_ROUTES = [
  "/",
  "/verify-email",
  "/reset-password",
  "/api/auth",
];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isAuthenticated = !!request.auth;

  // Check if the route is always public
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if accessing a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if accessing a public auth route (signin, signup, etc.)
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route while not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/login", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing public auth routes while authenticated
  if (isPublicAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
