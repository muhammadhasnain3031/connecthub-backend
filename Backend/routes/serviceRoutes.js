import express from 'express';
import Service from '../models/Service.js';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getTopProvidersMetrics 
} from '../controllers/serviceController.js';
import { protect, authorizeRoles, verifyOwnership } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js'; // 1. Upload middleware ko import kiya

const router = express.Router();

// Public listing
router.get('/', getAllServices);
router.get('/top-providers', getTopProvidersMetrics);
router.get('/:id', getServiceById);

// Protected mutation actions
// 2. POST route me upload.array('images', 5) inject kiya
router.post('/', protect, upload.array('images', 5), createService);

// 3. Optional: Agar update karte waqt bhi naye images dalne hon to PUT par bhi laga sakte hain
router.put('/:id', protect, verifyOwnership(Service), upload.array('images', 5), updateService);

router.delete('/:id', protect, authorizeRoles('provider'), deleteService);

export default router;
