/**
 * Rate Limiting Utility
 * 
 * Bu dosya, API endpoint'leri için rate limiting sağlar.
 * Production'da Upstash Redis kullanılması önerilir.
 * 
 * Kurulum için:
 * npm install @upstash/ratelimit @upstash/redis
 */

// In-memory rate limiting (development için)
// Production'da Redis kullanılmalı!

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  limit: number; // Max requests
  window: number; // Time window in seconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Simple in-memory rate limiter
 * 
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.window * 1000;
  const resetTime = now + windowMs;

  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime < now) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: resetTime,
    };
  }

  // Existing window
  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  entry.count++;

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Rate limit configurations
 */
export const RATE_LIMITS = {
  // General API - 100 requests per minute
  API: { limit: 100, window: 60 },

  // Auth endpoints - 5 attempts per 15 minutes
  AUTH: { limit: 5, window: 15 * 60 },

  // Email sending - 10 emails per hour
  EMAIL: { limit: 10, window: 60 * 60 },

  // Backup creation - 5 backups per hour
  BACKUP: { limit: 5, window: 60 * 60 },

  // Comment creation - 10 comments per minute
  COMMENT: { limit: 10, window: 60 },

  // Plan creation - 5 plans per hour
  PLAN: { limit: 5, window: 60 * 60 },

  // Group post creation - 10 posts per 15 minutes
  GROUP_POST: { limit: 10, window: 15 * 60 },

  // Group message sending - 60 messages per minute
  GROUP_MESSAGE: { limit: 60, window: 60 },

  // Group comment creation - 30 comments per 5 minutes
  GROUP_COMMENT: { limit: 30, window: 5 * 60 },

  // Group post like - 100 likes per minute
  GROUP_LIKE: { limit: 100, window: 60 },

  // Group event creation - 5 events per hour
  GROUP_EVENT: { limit: 5, window: 60 * 60 },

  // Group resource upload - 10 resources per hour
  GROUP_RESOURCE: { limit: 10, window: 60 * 60 },

  // Group member actions - 20 actions per minute
  GROUP_MEMBER_ACTION: { limit: 20, window: 60 },

  // Group join request - 10 requests per hour
  GROUP_JOIN: { limit: 10, window: 60 * 60 },
} as const;

/**
 * Get identifier from request (IP address or user ID)
 */
export function getIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  return `ip:${ip}`;
}

/**
 * Check rate limit and return response if exceeded
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  return rateLimit(identifier, config);
}

// ============================================
// Production Rate Limiting with Upstash Redis
// ============================================

/*
// Uncomment this section when using Upstash Redis in production

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = Redis.fromEnv();

// Create rate limiters
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:api",
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

export const emailRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "ratelimit:email",
});

export const backupRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "ratelimit:backup",
});

export const commentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:comment",
});

export const planRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "ratelimit:plan",
});

// Group-specific rate limiters
export const groupPostRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  analytics: true,
  prefix: "ratelimit:group:post",
});

export const groupMessageRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "ratelimit:group:message",
});

export const groupCommentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "5 m"),
  analytics: true,
  prefix: "ratelimit:group:comment",
});

export const groupLikeRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:group:like",
});

export const groupEventRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "ratelimit:group:event",
});

export const groupResourceRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "ratelimit:group:resource",
});

export const groupMemberActionRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "ratelimit:group:member",
});

export const groupJoinRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "ratelimit:group:join",
});

// Usage example:
export async function checkRateLimitRedis(
  identifier: string,
  limiter: Ratelimit
): Promise<RateLimitResult> {
  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset: reset * 1000, // Convert to milliseconds
  };
}
*/

/**
 * Rate limit helper for API routes
 * 
 * @param request - Request object
 * @param userId - Optional user ID
 * @param config - Rate limit configuration
 * @returns Rate limit result or throws error
 */
export async function applyRateLimit(
  request: Request,
  config: RateLimitConfig,
  userId?: string
): Promise<void> {
  const identifier = getIdentifier(request, userId);
  const result = rateLimit(identifier, config);

  if (!result.success) {
    const resetDate = new Date(result.reset);
    throw new Error(
      `Rate limit exceeded. Try again at ${resetDate.toISOString()}`
    );
  }
}

/**
 * Rate limit middleware wrapper
 * 
 * @param handler - API route handler
 * @param config - Rate limit configuration
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit<T>(
  handler: (request: Request, context?: any) => Promise<T>,
  config: RateLimitConfig
) {
  return async (request: Request, context?: any): Promise<T> => {
    await applyRateLimit(request, config);
    return handler(request, context);
  };
}

/**
 * Get rate limit headers for response
 * 
 * @param result - Rate limit result
 * @returns Headers object
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
}

/**
 * Create rate limit error response
 * 
 * @param result - Rate limit result
 * @returns Response object
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: {
        message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
        code: 'RATE_LIMIT_EXCEEDED',
        reset: new Date(result.reset).toISOString(),
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(result),
      },
    }
  );
}
