// src/services/cache.service.ts
// ============================================
// CACHE SERVICE — Upstash Redis
// Caches frequently accessed data to reduce DB load
// ============================================

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
});

// Cache TTL constants (in seconds)
export const TTL = {
  SHORT: 60,          // 1 minute — for volatile data
  MEDIUM: 300,        // 5 minutes — for semi-stable data
  LONG: 3600,         // 1 hour — for stable data
  DAY: 86400,         // 24 hours — for very stable data
};

// Cache key prefixes
export const KEYS = {
  USER: (id: string) => `user:${id}`,
  USER_BOOKINGS: (userId: string) => `user:${userId}:bookings`,
  BOOKING: (id: string) => `booking:${id}`,
  ADMIN_STATS: () => `admin:stats`,
  QUOTES_RAIL: (origin: string, dest: string) => `quotes:rail:${origin}:${dest}`,
  QUOTES_SEA: (origin: string, dest: string) => `quotes:sea:${origin}:${dest}`,
  QUOTES_AIR: (origin: string, dest: string) => `quotes:air:${origin}:${dest}`,
};

// Get from cache
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get<T>(key);
    if (data) console.log(`[CACHE HIT] ${key}`);
    return data;
  } catch (error) {
    console.error(`[CACHE ERROR] Get ${key}:`, error);
    return null;
  }
};

// Set to cache
export const setCache = async (key: string, value: any, ttl: number = TTL.MEDIUM): Promise<void> => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    console.log(`[CACHE SET] ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error(`[CACHE ERROR] Set ${key}:`, error);
  }
};

// Delete from cache
export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
    console.log(`[CACHE DELETE] ${key}`);
  } catch (error) {
    console.error(`[CACHE ERROR] Delete ${key}:`, error);
  }
};

// Delete multiple keys by pattern
export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => redis.del(key)));
      console.log(`[CACHE DELETE PATTERN] ${pattern} — ${keys.length} keys deleted`);
    }
  } catch (error) {
    console.error(`[CACHE ERROR] Delete pattern ${pattern}:`, error);
  }
};

// Cache-aside pattern helper
export const getOrSetCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = TTL.MEDIUM
): Promise<T> => {
  // Try cache first
  const cached = await getCache<T>(key);
  if (cached !== null) return cached;

  // Cache miss — fetch from DB
  console.log(`[CACHE MISS] ${key}`);
  const data = await fetchFn();

  // Store in cache
  await setCache(key, data, ttl);

  return data;
};

export default redis;