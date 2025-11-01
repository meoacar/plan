/**
 * Cache utility for group system
 * Supports both Redis (Vercel KV) and in-memory fallback
 */

// In-memory cache fallback
const memoryCache = new Map<string, { value: any; expiry: number }>();

// Check if Redis is configured
const isRedisConfigured = () => {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
};

// Lazy load Redis client
let redisClient: any = null;
const getRedisClient = async () => {
  if (!isRedisConfigured()) return null;
  
  if (!redisClient) {
    try {
      const { Redis } = await import('@upstash/redis');
      redisClient = new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
      });
    } catch (error) {
      console.warn('Redis client initialization failed, using memory cache:', error);
      return null;
    }
  }
  
  return redisClient;
};

/**
 * Get cached data or fetch and cache it
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300 // 5 minutes default
): Promise<T> {
  try {
    const redis = await getRedisClient();

    if (redis) {
      // Try Redis first
      const cached = await redis.get(key);
      if (cached !== null) {
        return cached as T;
      }

      // Fetch and cache
      const data = await fetcher();
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
      return data;
    } else {
      // Fallback to memory cache
      const now = Date.now();
      const cached = memoryCache.get(key);

      if (cached && cached.expiry > now) {
        return cached.value as T;
      }

      // Fetch and cache
      const data = await fetcher();
      memoryCache.set(key, {
        value: data,
        expiry: now + ttlSeconds * 1000,
      });

      return data;
    }
  } catch (error) {
    console.error('Cache error, fetching directly:', error);
    return await fetcher();
  }
}

/**
 * Invalidate cache by key or pattern
 */
export async function invalidateCache(keyOrPattern: string): Promise<void> {
  try {
    const redis = await getRedisClient();

    if (redis) {
      if (keyOrPattern.includes('*')) {
        // Pattern-based deletion (requires scan)
        const keys = await redis.keys(keyOrPattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        await redis.del(keyOrPattern);
      }
    } else {
      // Memory cache
      if (keyOrPattern.includes('*')) {
        const pattern = keyOrPattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        for (const key of memoryCache.keys()) {
          if (regex.test(key)) {
            memoryCache.delete(key);
          }
        }
      } else {
        memoryCache.delete(keyOrPattern);
      }
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Set cache value directly
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 300
): Promise<void> {
  try {
    const redis = await getRedisClient();

    if (redis) {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } else {
      memoryCache.set(key, {
        value,
        expiry: Date.now() + ttlSeconds * 1000,
      });
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Get cache value directly
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedisClient();

    if (redis) {
      const value = await redis.get(key);
      return value as T | null;
    } else {
      const now = Date.now();
      const cached = memoryCache.get(key);

      if (cached && cached.expiry > now) {
        return cached.value as T;
      }

      return null;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

// Cache key generators for consistency
export const CacheKeys = {
  groupStats: (groupId: string) => `group:${groupId}:stats`,
  groupLeaderboard: (groupId: string, period: string) => 
    `group:${groupId}:leaderboard:${period}`,
  groupRecommendations: (userId: string) => `user:${userId}:group-recommendations`,
  groupPreview: (groupId: string) => `group:${groupId}:preview`,
  popularGroups: () => 'groups:popular',
  groupMembers: (groupId: string) => `group:${groupId}:members`,
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};
