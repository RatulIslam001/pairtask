import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require CSRF protection
const PROTECTED_PATHS = [
  '/api/auth/register',
  '/api/auth/login',
  // Add other paths that need CSRF protection
];

// Function to generate a nonce
function generateNonce() {
  return Math.random().toString(36).substring(2, 15);
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  const headers = response.headers;
  
  // Add CSP header with nonce
  const nonce = generateNonce();
  headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`
  );

  // Add other security headers
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-XSS-Protection', '1; mode=block');

  // Check if the path requires CSRF protection
  if (PROTECTED_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    // Verify CSRF token for POST, PUT, DELETE requests
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      const token = request.headers.get('x-csrf-token');
      const cookie = request.cookies.get('csrf-token');

      if (!token || !cookie || token !== cookie.value) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 