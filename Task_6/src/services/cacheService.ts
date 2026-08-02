import redisClient from '../redis/client';

const CACHE_TTL = 3600; // 1 hour in seconds

export const cacheService = {
  // Get value from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        console.log(`[CACHE HIT] Key: ${key}`);
        return JSON.parse(cached) as T;
      }
      console.log(`[CACHE MISS] Key: ${key}`);
      return null;
    } catch (err) {
      console.error('[CACHE] GET error:', err);
      return null;
    }
  },

  // Set value in cache with TTL
  async set(key: string, value: unknown, ttl: number = CACHE_TTL): Promise<void> {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(value));
      console.log(`[CACHE SET] Key: ${key} | TTL: ${ttl}s`);
    } catch (err) {
      console.error('[CACHE] SET error:', err);
    }
  },

  // Delete cache key (active cache invalidation)
  async invalidate(key: string): Promise<void> {
    try {
      await redisClient.del(key);
      console.log(`[CACHE INVALIDATED] Key: ${key}`);
    } catch (err) {
      console.error('[CACHE] DEL error:', err);
    }
  },

  // Flush all keys matching a pattern (Bonus: invalidate all product caches)
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        console.log(`[CACHE INVALIDATED PATTERN] Pattern: ${pattern} | Keys removed: ${keys.length}`);
      }
    } catch (err) {
      console.error('[CACHE] Pattern invalidation error:', err);
    }
  }
};
