import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_SESSION_KEY } from '@/auth/core/session';

// Protected application routes based on StockMind demo & SKT
const protectedRoutes = [
  '/dashboard',
  '/inventory',
  '/compositions',
  '/orders',
  '/purchase-orders',
  '/suppliers',
  '/sales',
  '/suggestions',
  '/scanner',
  '/profile',
];

const authRoutes = ['/login', '/register'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(COOKIE_SESSION_KEY);
  const isAuthenticated = Boolean(sessionCookie?.value);

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Unauthenticated user trying to access protected route -> redirect to /login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login/register -> redirect to /dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sw.js, manifest.json, images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|images).*)',
  ],
};
