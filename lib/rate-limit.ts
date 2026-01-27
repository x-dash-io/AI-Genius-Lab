/**
 * Rate limiting utility with Upstash for production
 * Falls back to in-memory for development without Redis
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client if credentials are available
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * In-memory rate limiter fallback for development
 * Fixed: Added size limits and LRU eviction to prevent memory leaks
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
  lastAccessed: number;
}

class InMemoryRateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly MAX_SIZE = 10000; // Maximum entries before eviction
  private readonly CLEANUP_INTERVAL = 60 * 1000; // Cleanup every minute

  constructor() {
    // Start periodic cleanup
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
    }
  }

  check(
    key: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    
    // Evict oldest entries if we're at capacity
    if (this.limits.size >= this.MAX_SIZE) {
      this.evictOldest();
    }

    const entry = this.limits.get(key);

    if (!entry || now > entry.resetAt) {
      const resetAt = now + windowMs;
      this.limits.set(key, {
        count: 1,
        resetAt,
        lastAccessed: now,
      });

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt,
      };
    }

    if (entry.count >= maxRequests) {
      entry.lastAccessed = now; // Update access time
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    entry.count++;
    entry.lastAccessed = now;
    this.limits.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Evict oldest entries (LRU eviction)
   */
  private evictOldest(): void {
    const entries = Array.from(this.limits.entries());
    // Sort by lastAccessed, oldest first
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest 10% of entries
    const toRemove = Math.floor(this.MAX_SIZE * 0.1);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.limits.delete(entries[i][0]);
    }
  }

  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key);
        cleaned++;
      }
    }
    
    // If still over capacity after cleanup, evict oldest
    if (this.limits.size >= this.MAX_SIZE) {
      this.evictOldest();
    }
  }

  /**
   * Get current size (for monitoring)
   */
  getSize(): number {
    return this.limits.size;
  }
}

const inMemoryLimiter = new InMemoryRateLimiter();
// Cleanup is now handled by the InMemoryRateLimiter constructor

/**
 * Create Upstash rate limiters with different configurations
 */
const upstashLimiters = redis ? {
  // API routes: 100 requests per 15 minutes
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "15 m"),
    analytics: true,
    prefix: "ratelimit:api",
  }),
  
  // Auth routes: 5 requests per 15 minutes
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "ratelimit:auth",
  }),
  
  // Upload routes: 10 requests per hour
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "ratelimit:upload",
  }),
  
  // Review creation: 5 requests per hour
  review: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: true,
    prefix: "ratelimit:review",
  }),
} : null;

/**
 * Rate limit result type
 */
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Create a rate limiter function for a specific limit type
 */
function createRateLimiter(
  type: "api" | "auth" | "upload" | "review",
  maxRequests: number,
  windowMs: number
) {
  return async (identifier: string): Promise<RateLimitResult> => {
    if (upstashLimiters) {
      const result = await upstashLimiters[type].limit(identifier);
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    } else {
      // Fall back to in-memory
      return inMemoryLimiter.check(`${type}:${identifier}`, maxRequests, windowMs);
    }
  };
}

/**
 * Predefined rate limiters
 * These return async functions that check rate limits
 */
export const rateLimits = {
  // API routes: 100 requests per 15 minutes
  api: createRateLimiter("api", 100, 15 * 60 * 1000),
  
  // Auth routes: 5 requests per 15 minutes
  auth: createRateLimiter("auth", 5, 15 * 60 * 1000),
  
  // Upload routes: 10 requests per hour
  upload: createRateLimiter("upload", 10, 60 * 60 * 1000),
  
  // Review creation: 5 requests per hour
  review: createRateLimiter("review", 5, 60 * 60 * 1000),
};

/**
 * Legacy synchronous interface for backwards compatibility
 * Uses in-memory limiter only (for migration purposes)
 */
export const rateLimiter = {
  check: (key: string, maxRequests: number, windowMs: number) => {
    return inMemoryLimiter.check(key, maxRequests, windowMs);
  },
  cleanup: () => {
    inMemoryLimiter.cleanup();
  },
};

/**
 * Check if Upstash is available
 */
export function isUpstashAvailable(): boolean {
  return redis !== null;
}

/**
 * Helper to create a custom rate limiter
 */
export function createCustomRateLimit(
  prefix: string,
  maxRequests: number,
  windowSeconds: number
) {
  if (redis) {
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      analytics: true,
      prefix: `ratelimit:${prefix}`,
    });

    return async (identifier: string): Promise<RateLimitResult> => {
      const result = await limiter.limit(identifier);
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    };
  } else {
    return async (identifier: string): Promise<RateLimitResult> => {
      return inMemoryLimiter.check(`${prefix}:${identifier}`, maxRequests, windowSeconds * 1000);
    };
  }
}
