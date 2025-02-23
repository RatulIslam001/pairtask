import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Generate a random token
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

interface ResponseData {
  message?: string;
  error?: string;
  [key: string]: any;
}

// Set CSRF token in cookie and return it
export function setCsrfToken(): string {
  const token = generateToken();
  const cookieStore = cookies();
  cookieStore.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return token;
}

// Get CSRF token from cookie
export function getCsrfToken(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get('csrf-token')?.value;
}

// Create a response with CSRF token
export function createResponseWithCsrf(data: ResponseData, status: number = 200): NextResponse {
  const token = setCsrfToken();
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token,
    },
  });
}

// Validate CSRF token
export function validateCsrfToken(request: Request): boolean {
  const token = request.headers.get('x-csrf-token');
  const cookieToken = getCsrfToken();
  return !!token && !!cookieToken && token === cookieToken;
} 