import redisClient from '../config/redis.js';
import logger from '../config/logger.js';

/**
 * 🧠 CONCEPT NAME: Cache-Aside Pattern / Lazy Loading
 * Yeh middleware check karta hai ke kya requested data pehle se memory cache mein hai ya nahi.
 */
export const cacheServices = async (req, res, next) => {
  try {
    // Unique cache key banana pagination aur query parameters ke sath
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const category = req.query.category || 'all';
    const cacheKey = `services:page:${page}:limit:${limit}:cat:${category}`;

    // 1. Redis memory se key check karna
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      logger.info(`🎯 [Cache Hit]: Serving services list directly from Redis RAM Store.`);
      // Data parse karke foran response send kar dena, database query skip ho jayegi
      return res.status(200).json(JSON.parse(cachedData));
    }

    // 2. Cache Miss: Agar cache mein data nahi hai, toh key req object par save karein 
    // taake controller response ko cache kar sake
    req.servicesCacheKey = cacheKey;
    logger.info(`⚠️ [Cache Miss]: Data not found in Redis. Routing pipeline to MongoDB.`);
    
    next();
  } catch (error) {
    logger.error(`❌ Cache Middleware Error: ${error.message}`);
    next(); // System crash na ho, isliye catch block mein fallback karke next middleware par bhej dein
  }
};
