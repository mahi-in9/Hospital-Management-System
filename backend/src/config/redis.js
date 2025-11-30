import redis from "redis";
import { config } from "./env.js";

let redisClient = null;

export const getRedisClient = async () => {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = redis.createClient({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("✗ Redis reconnection failed after 10 attempts");
            return new Error("Redis reconnection failed");
          }
          return retries * 50;
        },
      },
    });

    redisClient.on("error", (err) => console.error("✗ Redis error:", err));
    redisClient.on("connect", () => console.log("✓ Redis connected"));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("✗ Redis connection error:", error.message);
    throw error;
  }
};

export const redisSet = async (key, value, ttl = null) => {
  const client = await getRedisClient();
  const options = ttl ? { EX: ttl } : {};
  await client.set(key, JSON.stringify(value), options);
};

export const redisGet = async (key) => {
  const client = await getRedisClient();
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
};

export const redisDel = async (key) => {
  const client = await getRedisClient();
  await client.del(key);
};

export const redisGetByPattern = async (pattern) => {
  const client = await getRedisClient();
  const keys = await client.keys(pattern);
  const values = {};
  for (const key of keys) {
    values[key] = await redisGet(key);
  }
  return values;
};

export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
