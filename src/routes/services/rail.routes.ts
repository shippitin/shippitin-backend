// src/routes/services/rail.routes.ts
import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { getRailQuotes, createRailBooking, trackRailShipment, getTerminals } from '../../integrations/concor';
import { query } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/quotes', protect, asyncHandler(async (req: any, res) => {
  const quotes = await getRailQuotes(req.body);
  for (const quote of quotes) {
    await query(
      `INSERT INTO quotes (id, user_id, service_type, origin, destination, cargo_details, quoted_price, valid_until, status, created_at)
       VALUES ($1, $2, 'Rail', $3, $4, $5, $6, $7, 'active', NOW())`,
      [uuidv4(), req.user.id, req.body.origin, req.body.destination, JSON.stringify(req.body), quote.price, quote.validUntil]
    );
  }
  res.json({ success: true, data: quotes });
}));

router.post('/book', protect, asyncHandler(async (req: any, res) => {
  const booking = await createRailBooking(req.body);
  await query(
    `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
     VALUES ($1, $2, $3, 'Rail', $4, $5, $6, $7, $8, 'confirmed', NOW())`,
    [uuidv4(), booking.bookingId, req.user.id, req.body.origin, req.body.destination, req.body.cargoType, req.body.weight, req.body.bookingDate]
  );
  res.json({ success: true, data: booking });
}));

router.get('/terminals', asyncHandler(async (req, res) => {
  const terminals = await getTerminals();
  res.json({ success: true, data: terminals });
}));

router.get('/track/:indentNumber', asyncHandler(async (req, res) => {
  const tracking = await trackRailShipment(req.params.indentNumber);
  res.json({ success: true, data: tracking });
}));

export default router;
