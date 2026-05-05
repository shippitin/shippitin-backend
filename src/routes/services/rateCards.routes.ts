// src/routes/services/rateCards.routes.ts
import { Router } from 'express';
import { protect, adminOnly } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  getQuotesHandler,
  getRateCardsHandler,
  createRateCardHandler,
  updateRateCardHandler,
  deleteRateCardHandler,
} from '../../controllers/quotes.controller';
import { getSearchStats, getSurgeRules } from '../../services/quotes.service';

const router = Router();

// Shippitin managed rate cards
router.get('/search',  protect,              asyncHandler(getQuotesHandler));
router.get('/',        protect, adminOnly,   asyncHandler(getRateCardsHandler));
router.post('/',       protect, adminOnly,   asyncHandler(createRateCardHandler));
router.put('/:id',     protect, adminOnly,   asyncHandler(updateRateCardHandler));
router.delete('/:id',  protect, adminOnly,   asyncHandler(deleteRateCardHandler));

// Demand stats + surge rules (admin only)
router.get('/demand/stats', protect, adminOnly, asyncHandler(async (req, res) => {
  const stats = await getSearchStats();
  res.json({ success: true, data: stats });
}));

router.get('/demand/rules', protect, adminOnly, asyncHandler(async (req, res) => {
  const rules = await getSurgeRules();
  res.json({ success: true, data: rules });
}));

export default router;
