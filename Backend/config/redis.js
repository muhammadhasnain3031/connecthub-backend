import { createClient } from 'redis';
import logger from './logger.js'; // Aapka Winston logger

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  logger.error('❌ Redis Connection Error: REDIS_URL missing in .env');
}

const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => {
  logger.error(`❌ Redis Client Error: ${err.message}`);
});

redisClient.on('connect', () => {
  logger.info('🚀 Connected to Upstash Cloud Redis successfully');
});

// Production Serverless Environment ke liye immediate asynchronous connection execution
await redisClient.connect();

export default redisClient;
