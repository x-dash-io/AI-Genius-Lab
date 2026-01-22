/**
 * Simple rate limiting utility
 * For production, consider using Upstash Redis or similar
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();

  /**
   * Check if request should be rate limited
   * @param key - Unique identifier (e.g., IP address, user ID)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  check(
    key: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetAt) {
      // Create new entry
      const resetAt = now + windowMs;
      this.limits.set(key, {
        count: 1,
        resetAt,
      });

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt,
      };
    }

    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    // Increment count
    entry.count++;
    this.limits.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Rate limit helper for API routes
 */
export function createRateLimit(
  maxRequests: number,
  windowMs: number
) {
  return (identifier: string) => {
    return rateLimiter.check(identifier, maxRequests, windowMs);
  };
}

// Predefined rate limits
export const rateLimits = {
  // API routes: 100 requests per 15 minutes
  api: createRateLimit(100, 15 * 60 * 1000),
  
  // Auth routes: 5 requests per 15 minutes
  auth: createRateLimit(5, 15 * 60 * 1000),
  
  // Upload routes: 10 requests per hour
  upload: createRateLimit(10, 60 * 60 * 1000),
  
  // Review creation: 5 requests per hour
  review: createRateLimit(5, 60 * 60 * 1000),
};
