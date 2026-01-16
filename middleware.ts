import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Allow root path without authentication
    if (req.nextUrl.pathname === '/') {
      return NextResponse.next();
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow root path without authentication
        if (pathname === '/') {
          return true;
        }

        // Allow public auth pages without authentication
        if (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/reset-password') {
          return true;
        }

        // Allow cron endpoints without user authentication (they use CRON_SECRET)
        if (pathname.startsWith('/api/cron/')) {
          return true;
        }

        // Allow nudge completion endpoints without user authentication (they use signed URLs)
        if (pathname.startsWith('/api/nudges/') && pathname.endsWith('/complete')) {
          return true;
        }

        // Allow static files from public folder (images, fonts, etc.)
        const staticFileExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
        const isStaticFile = staticFileExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
        if (isStaticFile) {
          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api/auth (NextAuth routes)
       * - api/cron (Cron job endpoints - use CRON_SECRET instead)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - Static file extensions (images, fonts, etc. from public folder)
       * - login, signup, forgot-password, reset-password (public pages)
       */
      '/((?!api/auth|api/cron|api/nudges/.*/complete|_next/static|_next/image|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico|.*\\.woff|.*\\.woff2|.*\\.ttf|.*\\.eot|login|signup|forgot-password|reset-password).*)',
    ],
};
