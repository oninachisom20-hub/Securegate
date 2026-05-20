import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Define a unified RateLimit interface
export interface RateLimiter {
  limit: (identifier: string) => Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }>;
}

const createRateLimiter = (): RateLimiter => {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redisClient = Redis.fromEnv();
      return new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        analytics: true,
      }) as unknown as RateLimiter;
    } catch {
      console.warn("Failed to initialize Upstash Redis. Falling back to mock rate limiter.");
    }
  }

  // Fallback mock rate limiter for local development
  return {
    limit: async () => ({
      success: true,
      limit: 5,
      remaining: 5,
      reset: Date.now(),
    }),
  };
};

export const rateLimit = createRateLimiter();
