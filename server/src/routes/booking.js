import express from 'express';
import { createBooking, getMyBookings } from '../controllers/booking.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/my-bookings', getMyBookings);
router.post('/', createBooking);

export default router;
