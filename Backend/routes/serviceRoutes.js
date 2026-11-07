import express from 'express';
import Service from '../models/Service.js';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getTopProvidersMetrics,
} from '../controllers/serviceController.js';
import {
  protect,
  authorizeRoles,
  verifyOwnership,
} from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js'; 
import { cacheServices } from '../middleware/cacheMiddleware.js'; // ⚡ DAY 41: Cache Middleware Imported

const router = express.Router();

// Public listing
// ⚡ DAY 41: Route Cache Aside Pattern Injection
router.get('/', cacheServices, getAllServices);
router.get('/top-providers', getTopProvidersMetrics);
router.get('/:id', getServiceById);

// Protected mutation actions
router.post('/', protect, upload.array('images', 5), createService);

router.put(
  '/:id',
  protect,
  verifyOwnership(Service),
  upload.array('images', 5),
  updateService
);

router.delete('/:id', protect, authorizeRoles('provider'), deleteService);

export default router;
  