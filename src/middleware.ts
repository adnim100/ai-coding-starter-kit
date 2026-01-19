import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define protected routes
const PROTECTED_ROUTES = [
  "/dashboard",
  "/projects",
  "/settings",
  "/api/projects",
  "/api/transcriptions",
  "/api/audio",
  "/api/settings",
];

// Define public routes that should redirect to dashboard if authenticated
const PUBLIC_AUTH_ROUTES = [
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
];

// Define routes that are always public
const PUBLIC_ROUTES = [
  "/",
  "/auth/error",
  "/auth/verify-request",
  "/api/auth",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is always public
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get the token (session)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Check if accessing a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if accessing a public auth route (signin, signup, etc.)
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect to signin if accessing protected route while not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing public auth routes while authenticated
  if (isPublicAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check if account is scheduled for deletion
  if (isAuthenticated && token.accountPendingDeletion) {
    // Allow access to settings to cancel deletion
    if (pathname.startsWith("/settings")) {
      return NextResponse.next();
    }

    // Redirect other routes to settings with warning
    if (isProtectedRoute && !pathname.startsWith("/settings")) {
      const settingsUrl = new URL("/settings/account", request.url);
      settingsUrl.searchParams.set("warning", "deletion-pending");
      return NextResponse.redirect(settingsUrl);
    }
  }

  return NextResponse.next();
}

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
