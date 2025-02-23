import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export interface RateLimitConfig {
  interval: number; // Time window in seconds
  limit: number; // Maximum number of requests per interval
}

export async function rateLimit(
  ip: string,
  endpoint: string,
  config: RateLimitConfig
) {
  const key = `rate-limit:${endpoint}:${ip}`;
  const now = Date.now();

  try {
    const requests = await redis.get<number[]>(key) || [];
    const recentRequests = requests.filter(
      (timestamp: number) => now - timestamp < config.interval * 1000
    );

    if (recentRequests.length >= config.limit) {
      return {
        success: false,
        response: new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            retryAfter: Math.ceil(
              (recentRequests[0] + config.interval * 1000 - now) / 1000
            ),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil(
                (recentRequests[0] + config.interval * 1000 - now) / 1000
              ).toString(),
            },
          }
        ),
      };
    }

    recentRequests.push(now);
    await redis.set(key, recentRequests, { ex: config.interval });

    return { success: true };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request to proceed
    return { success: true };
  }
} 