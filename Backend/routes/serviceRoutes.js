import express from 'express';
import Service from '../models/Service.js'
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { protect, authorizeRoles,verifyOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', protect,  createService);
router.put('/:id', protect, verifyOwnership(Service), updateService);

router.delete('/:id', protect, authorizeRoles('provider'), deleteService);

export default router;