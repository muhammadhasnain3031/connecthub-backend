import express from 'express';
// Functions ko separate named imports ke taur par call kiya
import { exportBookingsLog, createBooking, getUserBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Saare booking routes login required hain
router.use(protect);

// Day-16 wala route
router.get('/export', exportBookingsLog);

// --- Day-23 Core Booking Flow Routes ---
router.post('/', createBooking);
router.get('/', getUserBookings);
router.patch('/:id/status', updateBookingStatus);

export default router;
