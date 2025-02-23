import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db';
import { User, IUser } from '@/models/user';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { validateCsrfToken, createResponseWithCsrf } from '@/lib/csrf';
import { sanitizeInput } from '@/lib/sanitize';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    // Validate CSRF token
    if (!validateCsrfToken(req)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Apply rate limiting
    const headersList = headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    const rateLimitResult = await rateLimit(ip, 'register', {
      interval: 60, // 1 minute
      limit: 5, // 5 requests per minute
    });

    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    const body = await req.json();
    
    // Sanitize input
    const sanitizedData = {
      name: sanitizeInput(body.name),
      email: sanitizeInput(body.email),
      password: body.password, // Don't sanitize password
    };
    
    // Validate input
    const validatedData = registerSchema.parse(sanitizedData);

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email }).exec();
    if (existingUser) {
      return createResponseWithCsrf(
        { error: 'User with this email already exists' },
        400
      );
    }

    // Create new user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password, // Will be hashed by the pre-save hook
    }) as IUser;

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    return createResponseWithCsrf(
      { message: 'User registered successfully', user: userObj },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createResponseWithCsrf(
        { error: error.errors[0].message },
        400
      );
    }

    console.error('Registration error:', error);
    return createResponseWithCsrf(
      { error: 'Something went wrong' },
      500
    );
  }
} 