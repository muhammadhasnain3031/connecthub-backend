import express from 'express';
import { exportBookingsLog } from '../controllers/bookingController.js';

const router = express.Router();

router.get('/export', exportBookingsLog);

export default router;
