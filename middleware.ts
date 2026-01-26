import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Only set CSP in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.paypal.com https://*.cloudinary.com;"
    );
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check admin role
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Protect authenticated routes - all routes under (app) folder
  const protectedRoutes = [
    "/dashboard",
    "/library",
    "/profile",
    "/activity",
  ];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Prevent admin users from accessing customer-only pages
    // Admins should use /admin routes, not customer dashboard/library/profile/activity
    const customerOnlyRoutes = ["/dashboard", "/library", "/activity", "/profile"];
    const isCustomerOnlyRoute = customerOnlyRoutes.some((route) => pathname.startsWith(route));

    if (isCustomerOnlyRoute && token.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Protect premium/subscription routes
  const premiumRoutes = [
    "/premium",
  ];

  const isPremiumRoute = premiumRoutes.some((route) => pathname.startsWith(route));

  if (isPremiumRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user has active subscription
    // Note: In a real implementation, you'd want to verify this in the backend
    // This is just a basic check - the actual verification should happen in the API/routes
    if (!token.hasActiveSubscription) {
      const upgradeUrl = new URL("/subscription", request.url);
      upgradeUrl.searchParams.set("upgrade", "required");
      return NextResponse.redirect(upgradeUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
