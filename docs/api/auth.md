# Authentication API Documentation

## Overview
This document outlines the authentication endpoints available in the application.

## Base URL
```
http://localhost:3000/api/auth
```

## Endpoints

### Register User
```http
POST /api/auth/register
```

Creates a new user account.

#### Request Body
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

#### Validation Rules
- `name`: Minimum 2 characters
- `email`: Valid email format
- `password`: Minimum 6 characters

#### Response
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string | null",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### Error Responses
- `400 Bad Request`: Invalid input data or email already exists
- `403 Forbidden`: Invalid CSRF token
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Login
```http
POST /api/auth/login
```

Authenticates a user and creates a session.

#### Request Body
```json
{
  "email": "string",
  "password": "string"
}
```

#### Response
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string | null"
  }
}
```

#### Error Responses
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Invalid CSRF token
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Get Session
```http
GET /api/auth/session
```

Returns the current user session if authenticated.

#### Response
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string | null"
  }
}
```

#### Error Responses
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

### Logout
```http
POST /api/auth/logout
```

Ends the current user session.

#### Response
```json
{
  "message": "Logged out successfully"
}
```

## Security

### CSRF Protection
All POST endpoints require a CSRF token. The token should be:
1. Included in the request header as `x-csrf-token`
2. Matched with the token in the `csrf-token` cookie

### Rate Limiting
- Registration: 5 requests per minute per IP
- Login: 10 requests per minute per IP

### Input Sanitization
All input data is sanitized to prevent XSS attacks and other injection vulnerabilities.

### Session Security
- HTTP-only cookies
- Secure in production
- Same-site strict
- Session expiry: 24 hours

## Error Handling

All error responses follow this format:
```json
{
  "error": "string"
}
```

## Testing

To run the authentication tests:
```bash
npm test __tests__/auth
``` 