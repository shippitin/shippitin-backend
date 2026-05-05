// src/routes/quotes.routes.ts
// ============================================
// QUOTES ROUTER — Mounts per-service modules
// Each service is its own module in /services/
// ============================================

import { Router } from 'express';
import railRoutes       from './services/rail.routes';
import seaRoutes        from './services/sea.routes';
import airRoutes        from './services/air.routes';
import truckRoutes      from './services/truck.routes';
import portRoutes       from './services/port.routes';
import customsRoutes    from './services/customs.routes';
import insuranceRoutes  from './services/insurance.routes';
import lclRoutes        from './services/lcl.routes';
import parcelRoutes     from './services/parcel.routes';
import rateCardsRoutes  from './services/rateCards.routes';

const router = Router();

router.use('/rail',       railRoutes);
router.use('/sea',        seaRoutes);
router.use('/air',        airRoutes);
router.use('/truck',      truckRoutes);
router.use('/port',       portRoutes);
router.use('/customs',    customsRoutes);
router.use('/insurance',  insuranceRoutes);
router.use('/lcl',        lclRoutes);
router.use('/parcel',     parcelRoutes);
router.use('/rate-cards', rateCardsRoutes);

export default router;
