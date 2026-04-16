import { Router } from 'express';
import {
  trackShipment,
  addTrackingEvent,
} from '../controllers/tracking.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public route - anyone can track with booking number
router.get('/:bookingNumber', trackShipment);

// Protected route - only internal use
router.post('/:bookingId/events', protect, addTrackingEvent);

export default router;