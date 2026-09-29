import express from 'express';
import Service from '../models/Service.js'
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getTopProvidersMetrics 
} from '../controllers/serviceController.js';
import { protect, authorizeRoles, verifyOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public listing
router.get('/', getAllServices);


router.get('/top-providers', getTopProvidersMetrics);

// Individual item specs routes
router.get('/:id', getServiceById);

// Protected mutation actions
router.post('/', protect, createService);
router.put('/:id', protect, verifyOwnership(Service), updateService);
router.delete('/:id', protect, authorizeRoles('provider'), deleteService);

export default router;
