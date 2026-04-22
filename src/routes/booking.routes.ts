import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';
import { bookingValidator, validate } from '../middleware/validate.middleware';

const router = Router();

router.use(protect);

router.post('/', bookingValidator, validate, createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

export default router;