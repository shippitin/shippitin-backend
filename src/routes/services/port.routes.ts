// src/routes/services/port.routes.ts
import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { validateBody, portQuoteSchema, portBookSchema } from '../../middleware/validate.zod';
import { getPortServiceQuote, createPortBooking, getPortStatus, getMajorPorts } from '../../integrations/port';
import { query } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/quote', protect, validateBody(portQuoteSchema), asyncHandler(async (req: any, res) => {
  const quote = await getPortServiceQuote(req.body);
  res.json({ success: true, data: quote });
}));

router.post('/book', protect, validateBody(portBookSchema), asyncHandler(async (req: any, res) => {
  const booking = await createPortBooking(req.body);
  await query(
    `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
     VALUES ($1, $2, $3, 'Port', $4, $4, $5, $6, $7, 'confirmed', NOW())`,
    [uuidv4(), booking.bookingId, req.user.id, req.body.portCode, req.body.serviceCategory, req.body.cargoWeight || 0, req.body.arrivalDate]
  );
  res.json({ success: true, data: booking });
}));

router.get('/status/:portCallNumber', asyncHandler(async (req, res) => {
  const status = await getPortStatus(req.params.portCallNumber);
  res.json({ success: true, data: status });
}));

router.get('/list', asyncHandler(async (req, res) => {
  const ports = await getMajorPorts();
  res.json({ success: true, data: ports });
}));

export default router;
