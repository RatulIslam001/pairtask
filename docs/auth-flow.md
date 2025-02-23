# Authentication Flow Documentation

## Overview
This document describes the authentication flow implemented in the application, including registration, login, session management, and security measures.

## Authentication Flow

### Registration Flow
1. User submits registration form with name, email, and password
2. CSRF token is validated
3. Rate limiting is checked
4. Input data is sanitized and validated
5. Check if email already exists
6. Password is hashed using bcrypt
7. User is created in the database
8. Success response is returned with user data (excluding password)

### Login Flow
1. User submits login form with email and password
2. CSRF token is validated
3. Rate limiting is checked
4. User is looked up by email
5. Password is verified using bcrypt
6. Session is created using NextAuth.js
7. JWT token is generated and stored in HTTP-only cookie
8. Success response is returned with user data

### Session Management
- Sessions are managed by NextAuth.js
- JWT strategy is used for session storage
- Tokens are stored in HTTP-only cookies
- Session duration is 24 hours
- Automatic token refresh is handled by NextAuth.js

### Logout Flow
1. User requests logout
2. Session is invalidated
3. Cookies are cleared
4. User is redirected to login page

## Security Measures

### Password Security
- Passwords are hashed using bcrypt with a salt round of 10
- Original passwords are never stored or logged
- Password validation requires minimum 6 characters

### CSRF Protection
- CSRF tokens are required for all POST requests
- Tokens are validated on both client and server side
- New tokens are generated for each session

### Rate Limiting
- Implemented using Upstash Redis
- Limits are enforced per IP address
- Different limits for different endpoints
- Exponential backoff for repeated failures

### Input Sanitization
- All user input is sanitized using DOMPurify
- HTML characters are escaped
- Special characters are handled safely
- Email addresses are normalized

### XSS Prevention
- Content Security Policy (CSP) headers
- Input sanitization on all user data
- Output encoding for dynamic content
- HTTP security headers

## State Management

### Auth Store (Zustand)
```typescript
interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}
```

### Usage Example
```typescript
const { user, setUser } = useAuth();

// Check if user is authenticated
if (user) {
  // User is logged in
} else {
  // User is not logged in
}
```

## Error Handling

### Common Error Scenarios
1. Invalid credentials
2. Rate limit exceeded
3. Invalid CSRF token
4. Network errors
5. Server errors

### Error Response Format
```typescript
interface ErrorResponse {
  error: string;
  retryAfter?: number; // For rate limiting
}
```

## Integration Points

### With Frontend
- Auth context provider wraps the application
- Protected routes check auth state
- Loading states during auth operations
- Error handling and display

### With Backend
- Database connection for user storage
- Session management
- Security middleware
- Rate limiting service

## Testing

### Unit Tests
- User model validation
- Password hashing
- Token generation
- Input sanitization

### Integration Tests
- Registration flow
- Login flow
- Session management
- Rate limiting
- CSRF protection

### Running Tests
```bash
# Run all tests
npm test

# Run auth tests only
npm test __tests__/auth

# Run with coverage
npm run test:coverage
``` 