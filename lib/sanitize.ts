import { escape } from 'html-escaper';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The user input to sanitize
 * @returns The sanitized input
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  // First escape HTML special characters
  const escaped = escape(input);

  // Then use DOMPurify for additional security
  const sanitized = DOMPurify.sanitize(escaped, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });

  return sanitized.trim();
}

/**
 * Sanitizes an object's string values recursively
 * @param obj - The object to sanitize
 * @returns The sanitized object
 */
export function sanitizeObject<T extends { [key: string]: unknown }>(obj: T): T {
  const result = { ...obj };

  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const value = result[key];
      if (typeof value === 'string') {
        (result[key] as unknown) = sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeObject(value as { [key: string]: unknown }) as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Validates and sanitizes an email address
 * @param email - The email address to validate and sanitize
 * @returns The sanitized email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Remove any whitespace and convert to lowercase
  return email.trim().toLowerCase();
} 