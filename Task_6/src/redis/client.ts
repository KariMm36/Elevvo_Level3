import Redis from 'ioredis';

const USE_MOCK = process.env.USE_REDIS_MOCK === 'true' || process.env.NODE_ENV === 'test';

let redisClient: Redis;

if (USE_MOCK) {
  // Use in-memory mock Redis for testing without a real Redis server
  const RedisMock = require('ioredis-mock');
  redisClient = new RedisMock();
  console.log('[REDIS] Using in-memory mock Redis client (test/offline mode)');
} else {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    lazyConnect: true,
    retryStrategy: (times: number) => {
      if (times > 3) {
        console.error('[REDIS] Connection failed after 3 retries. Disabling Redis caching.');
        return null;
      }
      return Math.min(times * 200, 2000);
    }
  });

  redisClient.on('connect', () => console.log('[REDIS] Connected to Redis server at localhost:6379'));
  redisClient.on('error', (err: Error) => console.error('[REDIS] Connection error:', err.message));
}

export default redisClient;
