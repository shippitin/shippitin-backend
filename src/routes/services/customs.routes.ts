// src/routes/services/customs.routes.ts
import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { getCustomsQuote, fileCustomsDeclaration, getCustomsStatus, getHSCodeDetails } from '../../integrations/customs';
import { query } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/quote', protect, asyncHandler(async (req: any, res) => {
  const quote = await getCustomsQuote(req.body);
  res.json({ success: true, data: quote });
}));

router.post('/file', protect, asyncHandler(async (req: any, res) => {
  const filing = await fileCustomsDeclaration(req.body);
  await query(
    `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
     VALUES ($1, $2, $3, 'Customs', $4, $5, $6, $7, NOW(), 'filed', NOW())`,
    [uuidv4(), filing.filingId, req.user.id, req.body.countryOfOrigin, req.body.portOfEntry, req.body.cargoType, req.body.weight]
  );
  res.json({ success: true, data: filing });
}));

router.get('/status/:beNumber', asyncHandler(async (req, res) => {
  const status = await getCustomsStatus(req.params.beNumber);
  res.json({ success: true, data: status });
}));

router.get('/hscode/:hsCode', asyncHandler(async (req, res) => {
  const details = await getHSCodeDetails(req.params.hsCode);
  res.json({ success: true, data: details });
}));

export default router;
