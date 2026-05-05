// src/routes/services/air.routes.ts
import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { getAirQuotes, createAirBooking, trackAirShipment, getAirports } from '../../integrations/air';
import { query } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/quotes', protect, asyncHandler(async (req: any, res) => {
  const quotes = await getAirQuotes(req.body);
  res.json({ success: true, data: quotes });
}));

router.post('/book', protect, asyncHandler(async (req: any, res) => {
  const booking = await createAirBooking(req.body);
  await query(
    `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
     VALUES ($1, $2, $3, 'Air', $4, $5, $6, $7, $8, 'confirmed', NOW())`,
    [uuidv4(), booking.bookingId, req.user.id, req.body.originAirport, req.body.destinationAirport, req.body.cargoType, req.body.weight, req.body.bookingDate]
  );
  res.json({ success: true, data: booking });
}));

router.get('/airports', asyncHandler(async (req, res) => {
  const airports = await getAirports();
  res.json({ success: true, data: airports });
}));

router.get('/track/:awbNumber', asyncHandler(async (req, res) => {
  const tracking = await trackAirShipment(req.params.awbNumber);
  res.json({ success: true, data: tracking });
}));

export default router;
