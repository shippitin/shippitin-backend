// src/routes/booking.routes.ts
import { Router } from 'express';
import {
  createBookingHandler,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody, createBookingSchema } from '../middleware/validate.zod';

const router = Router();

router.use(protect);

router.post('/',          validateBody(createBookingSchema), asyncHandler(createBookingHandler));
router.get('/',                                              asyncHandler(getMyBookings));
router.get('/:id',                                           asyncHandler(getBookingById));
router.put('/:id/cancel',                                    asyncHandler(cancelBooking));

export default router;
