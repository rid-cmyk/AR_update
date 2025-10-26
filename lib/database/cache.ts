import { createClient } from 'redis';

// Redis client for caching
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Cache keys
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'dashboard:stats',
  USER_PROFILE: (userId: number) => `user:profile:${userId}`,
  HALAQAH_LIST: 'halaqah:list',
  ANNOUNCEMENTS: 'announcements:list',
  ANALYTICS_DATA: (type: string) => `analytics:${type}`,
};

// Cache TTL in seconds
export const CACHE_TTL = {
  DASHBOARD_STATS: 300, // 5 minutes
  USER_PROFILE: 600,    // 10 minutes
  HALAQAH_LIST: 300,    // 5 minutes
  ANNOUNCEMENTS: 180,   // 3 minutes
  ANALYTICS_DATA: 600,  // 10 minutes
};

// Cache operations
export const cache = {
  async get(key: string) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key: string, value: any, ttl?: number) {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await redis.setEx(key, ttl, serializedValue);
      } else {
        await redis.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async del(key: string) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  },

  async clear(pattern: string) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
};

export default redis;