import { Router } from 'express';
import {
  trackShipment,
  addTrackingEvent,
} from '../controllers/tracking.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/:bookingNumber', trackShipment);
router.post('/:bookingId/events', protect, addTrackingEvent);

export default router;