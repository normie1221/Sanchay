/**
 * Rate limiting implementation using in-memory store
 * For production, consider using Redis or similar
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
}

export function rateLimit(config: RateLimitConfig = {}) {
  const maxRequests = config.maxRequests || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  const windowMs = config.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes

  return async (identifier: string): Promise<{ success: boolean; remaining: number }> => {
    const now = Date.now();
    const record = store[identifier];

    if (!record || now > record.resetTime) {
      store[identifier] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return { success: true, remaining: maxRequests - 1 };
    }

    if (record.count >= maxRequests) {
      return { success: false, remaining: 0 };
    }

    record.count++;
    return { success: true, remaining: maxRequests - record.count };
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 60000); // Clean up every minute
