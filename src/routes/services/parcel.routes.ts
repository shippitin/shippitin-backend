// src/routes/services/parcel.routes.ts
import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { getParcelQuotes, createParcelBooking, trackParcel } from '../../integrations/parcel';
import { query } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/quotes', protect, asyncHandler(async (req: any, res) => {
  const quotes = await getParcelQuotes(req.body);
  res.json({ success: true, data: quotes });
}));

router.post('/book', protect, asyncHandler(async (req: any, res) => {
  const booking = await createParcelBooking(req.body);
  await query(
    `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
     VALUES ($1, $2, $3, 'Parcel', $4, $5, $6, $7, $8, 'confirmed', NOW())`,
    [uuidv4(), booking.bookingId, req.user.id, req.body.originPincode, req.body.destinationPincode, req.body.description, req.body.weight, req.body.bookingDate]
  );
  res.json({ success: true, data: booking });
}));

router.get('/track/:awbNumber', asyncHandler(async (req, res) => {
  const tracking = await trackParcel(req.params.awbNumber);
  res.json({ success: true, data: tracking });
}));

export default router;
