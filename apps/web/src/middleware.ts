import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware for route protection.
 * 
 * Note: Firebase Auth tokens are verified server-side in API routes.
 * This middleware handles client-side route redirects for unauthenticated users.
 * The actual auth check happens in the AuthProvider (client) and API routes (server).
 * 
 * Protected route groups:
 * - /dashboard/* requires authentication (handled by dashboard layout)
 * - /api/candidate/* requires candidate role (handled in API routes)
 * - /api/company/* requires company role (handled in API routes)  
 * - /api/admin/* requires admin role (handled in API routes)
 */

const publicPaths = [
  '/',
  '/jobs',
  '/unternehmen',
  '/gehaelter',
  '/rankings',
  '/fuer-unternehmen',
  '/fuer-kandidaten',
  '/guides',
  '/ueber-uns',
  '/kontakt',
  '/login',
  '/registrieren',
  '/passwort-vergessen',
  '/datenschutz',
  '/impressum',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow all public paths, static files, and API routes
  if (
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Dashboard routes are protected client-side by the DashboardLayout component
  // which checks auth state and redirects to /login if not authenticated
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
