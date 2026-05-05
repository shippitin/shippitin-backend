// src/routes/services/insurance.routes.ts
import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { getInsuranceQuotes, createInsurancePolicy, fileClaim } from '../../integrations/insurance';

const router = Router();

router.post('/quotes', protect, asyncHandler(async (req: any, res) => {
  const quotes = await getInsuranceQuotes(req.body);
  res.json({ success: true, data: quotes });
}));

router.post('/policy', protect, asyncHandler(async (req: any, res) => {
  const policy = await createInsurancePolicy(req.body);
  res.json({ success: true, data: policy });
}));

router.post('/claim', protect, asyncHandler(async (req: any, res) => {
  const claim = await fileClaim(req.body);
  res.json({ success: true, data: claim });
}));

export default router;
