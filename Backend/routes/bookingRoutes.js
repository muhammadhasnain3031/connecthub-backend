import express from 'express';
import { exportBookingsLog, createBooking, getUserBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/export', exportBookingsLog);
router.post('/', createBooking);
router.get('/', getUserBookings);
router.patch('/:id/status', updateBookingStatus);

export default router;
