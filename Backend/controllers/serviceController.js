import serviceService from '../services/serviceService.js';
import redisClient from '../config/redis.js'; // ⚡ DAY 41 INTEGRATION: Cloud Redis Engine
import logger from '../config/logger.js'; // Winston Logger

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * 🚀 CREATE NEW SERVICE
 * MongoDB write operations + Redis Cache Invalidation trigger
 */
export const createService = catchAsync(async (req, res) => {
  const providerId = req.user.id || req.user._id;

  // 1. Agar multiple files upload hui hain (req.files), to unke cloud paths (URLs) ka array banayein
  const imageUrls = req.files ? req.files.map((file) => file.path) : [];

  // 2. req.body ke andar 'images' ka array inject karein taake service layer ko mil sake
  const serviceData = {
    ...req.body,
    images: imageUrls,
  };

  // 3. Purane req.body ki jagah ab updated serviceData pass karein
  const service = await serviceService.createService(providerId, serviceData);

  // ========================================================
  // ⚡ DAY 41: CACHE INVALIDATION (Pattern: Purge Wildcard Keys)
  // ========================================================
  try {
    const keys = await redisClient.keys('services:page:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`🧹 [Cache Invalidation]: Purged ${keys.length} stale service cache entries due to new creation.`);
    }
  } catch (cacheError) {
    logger.error(`❌ Cache Invalidation Failed on Create: ${cacheError.message}`);
  }

  res.status(201).json({
    message: 'Service created successfully',
    service,
  });
});

/**
 * 🔍 READ ALL SERVICES WITH LAZY CACHING
 * Concept Pattern: Cache-Aside / Lazy Loading
 */
export const getAllServices = catchAsync(async (req, res) => {
  // 1. MongoDB se raw data fetch karein
  const result = await serviceService.getServices(req.query);

  // 2. ⚡ DAY 41: Cache Miss Post-Save Sync
  // Agar hamare cache middleware ne key generate ki thi, to database response ko Redis RAM mein save karein
  if (req.servicesCacheKey && result) {
    try {
      // setEx ka matlab hai 'Set with Expiration'. Data 1 Ghante (3600 seconds) ke liye cache ho raha hai
      await redisClient.setEx(req.servicesCacheKey, 3600, JSON.stringify(result));
      logger.info(`💾 [Cache Sync]: Database response saved securely into Redis Memory. Key: ${req.servicesCacheKey}`);
    } catch (cacheError) {
      logger.error(`❌ Redis Set Cache Failed: ${cacheError.message}`);
    }
  }

  res.status(200).json(result);
});

// Read Single Service By ID
export const getServiceById = catchAsync(async (req, res) => {
  const service = await serviceService.getServiceById(req.params.id);
  res.status(200).json({ service });
});

/**
 * 🔄 UPDATE EXISTING SERVICE
 * Database sync + Dynamic cache flush trigger
 */
export const updateService = catchAsync(async (req, res) => {
  const updatedService = await serviceService.updateService(
    req.params.id,
    req.body
  );

  // ========================================================
  // ⚡ DAY 41: CACHE INVALIDATION ON DATA ALTERATION
  // ========================================================
  try {
    const keys = await redisClient.keys('services:page:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`🧹 [Cache Invalidation]: Flushed stale service records from cache after updates.`);
    }
  } catch (cacheError) {
    logger.error(`❌ Cache Invalidation Failed on Update: ${cacheError.message}`);
  }

  res.status(200).json({
    message: 'Service updated successfully',
    service: updatedService,
  });
});

/**
 * ❌ DELETE SERVICE FROM ECOSYSTEM
 */
export const deleteService = catchAsync(async (req, res) => {
  await serviceService.deleteService(req.params.id);

  // ========================================================
  // ⚡ DAY 41: CLEAN CACHE TRACKS UPON REMOVAL
  // ========================================================
  try {
    const keys = await redisClient.keys('services:page:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`🧹 [Cache Invalidation]: Cleared services memory tracks following record deletion.`);
    }
  } catch (cacheError) {
    logger.error(`❌ Cache Invalidation Failed on Delete: ${cacheError.message}`);
  }

  res.status(200).json({ message: 'Service deleted successfully' });
});

// Read Analytics / Top Providers Metrics Pipeline
export const getTopProvidersMetrics = catchAsync(async (req, res) => {
  const analyticsData = await serviceService.getTopProviders();

  res.status(200).json({
    success: true,
    message: 'Top analytics pipeline metrics fetched successfully',
    data: analyticsData,
  });
});
