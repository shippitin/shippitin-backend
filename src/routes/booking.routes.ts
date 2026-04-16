import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All booking routes are protected
router.use(protect);

router.post('/', createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

export default router;