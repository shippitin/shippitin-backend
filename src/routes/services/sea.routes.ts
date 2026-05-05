// src/routes/services/sea.routes.ts
import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { getSeaQuotes, createSeaBooking, trackSeaShipment, getSeaPorts } from '../../integrations/sea';
import { query } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/quotes', protect, asyncHandler(async (req: any, res) => {
  const quotes = await getSeaQuotes(req.body);
  res.json({ success: true, data: quotes });
}));

router.post('/book', protect, asyncHandler(async (req: any, res) => {
  const booking = await createSeaBooking(req.body);
  await query(
    `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
     VALUES ($1, $2, $3, 'Sea', $4, $5, $6, $7, $8, 'confirmed', NOW())`,
    [uuidv4(), booking.bookingId, req.user.id, req.body.originPort, req.body.destinationPort, req.body.cargoType, req.body.weight, req.body.bookingDate]
  );
  res.json({ success: true, data: booking });
}));

router.get('/ports', asyncHandler(async (req, res) => {
  const ports = await getSeaPorts();
  res.json({ success: true, data: ports });
}));

router.get('/track/:blNumber', asyncHandler(async (req, res) => {
  const tracking = await trackSeaShipment(req.params.blNumber);
  res.json({ success: true, data: tracking });
}));

export default router;
