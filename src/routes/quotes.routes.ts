// src/routes/quotes.routes.ts
import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { getQuotesHandler, getRateCardsHandler, createRateCardHandler, updateRateCardHandler, deleteRateCardHandler } from '../controllers/quotes.controller';
import {
  getRailQuotes,
  createRailBooking,
  trackRailShipment,
  getTerminals,
} from '../integrations/concor';
import {
  getSeaQuotes,
  createSeaBooking,
  trackSeaShipment,
  getSeaPorts,
} from '../integrations/sea';
import {
  getAirQuotes,
  createAirBooking,
  trackAirShipment,
  getAirports,
} from '../integrations/air';
import {
  getTruckQuotes,
  createTruckBooking,
  trackTruckShipment,
} from '../integrations/truck';
import {
  getCustomsQuote,
  fileCustomsDeclaration,
  getCustomsStatus,
  getHSCodeDetails,
} from '../integrations/customs';
import {
  getPortServiceQuote,
  createPortBooking,
  getPortStatus,
  getMajorPorts,
} from '../integrations/port';
import {
  getInsuranceQuotes,
  createInsurancePolicy,
  fileClaim,
} from '../integrations/insurance';
import {
  getLCLQuotes,
  createLCLBooking,
  trackLCLShipment,
} from '../integrations/lcl';
import {
  getParcelQuotes,
  createParcelBooking,
  trackParcel,
} from '../integrations/parcel';
import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================
// RATE CARDS — Shippitin managed rates from DB
// ============================================
router.get('/rate-cards/search', protect, getQuotesHandler);
router.get('/rate-cards', protect, adminOnly, getRateCardsHandler);
router.post('/rate-cards', protect, adminOnly, createRateCardHandler);
router.put('/rate-cards/:id', protect, adminOnly, updateRateCardHandler);
router.delete('/rate-cards/:id', protect, adminOnly, deleteRateCardHandler);

// ============================================
// RAIL ROUTES
// ============================================
router.post('/rail/quotes', protect, async (req: any, res) => {
  try {
    const quotes = await getRailQuotes(req.body);
    for (const quote of quotes) {
      await query(
        `INSERT INTO quotes (id, user_id, service_type, origin, destination, cargo_details, quoted_price, valid_until, status, created_at)
         VALUES ($1, $2, 'Rail', $3, $4, $5, $6, $7, 'active', NOW())`,
        [uuidv4(), req.user.id, req.body.origin, req.body.destination, JSON.stringify(req.body), quote.price, quote.validUntil]
      );
    }
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching rail quotes' });
  }
});

router.post('/rail/book', protect, async (req: any, res) => {
  try {
    const booking = await createRailBooking(req.body);
    await query(
      `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
       VALUES ($1, $2, $3, 'Rail', $4, $5, $6, $7, $8, 'confirmed', NOW())`,
      [uuidv4(), booking.bookingId, req.user.id, req.body.origin, req.body.destination, req.body.cargoType, req.body.weight, req.body.bookingDate]
    );
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating rail booking' });
  }
});

router.get('/rail/terminals', async (req, res) => {
  try {
    const terminals = await getTerminals();
    res.json({ success: true, data: terminals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching terminals' });
  }
});

router.get('/rail/track/:indentNumber', async (req, res) => {
  try {
    const tracking = await trackRailShipment(req.params.indentNumber);
    res.json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking shipment' });
  }
});

// ============================================
// SEA ROUTES
// ============================================
router.post('/sea/quotes', protect, async (req: any, res) => {
  try {
    const quotes = await getSeaQuotes(req.body);
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching sea quotes' });
  }
});

router.post('/sea/book', protect, async (req: any, res) => {
  try {
    const booking = await createSeaBooking(req.body);
    await query(
      `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
       VALUES ($1, $2, $3, 'Sea', $4, $5, $6, $7, $8, 'confirmed', NOW())`,
      [uuidv4(), booking.bookingId, req.user.id, req.body.originPort, req.body.destinationPort, req.body.cargoType, req.body.weight, req.body.bookingDate]
    );
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating sea booking' });
  }
});

router.get('/sea/ports', async (req, res) => {
  try {
    const ports = await getSeaPorts();
    res.json({ success: true, data: ports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching ports' });
  }
});

router.get('/sea/track/:blNumber', async (req, res) => {
  try {
    const tracking = await trackSeaShipment(req.params.blNumber);
    res.json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking shipment' });
  }
});

// ============================================
// AIR ROUTES
// ============================================
router.post('/air/quotes', protect, async (req: any, res) => {
  try {
    const quotes = await getAirQuotes(req.body);
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching air quotes' });
  }
});

router.post('/air/book', protect, async (req: any, res) => {
  try {
    const booking = await createAirBooking(req.body);
    await query(
      `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
       VALUES ($1, $2, $3, 'Air', $4, $5, $6, $7, $8, 'confirmed', NOW())`,
      [uuidv4(), booking.bookingId, req.user.id, req.body.originAirport, req.body.destinationAirport, req.body.cargoType, req.body.weight, req.body.bookingDate]
    );
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating air booking' });
  }
});

router.get('/air/airports', async (req, res) => {
  try {
    const airports = await getAirports();
    res.json({ success: true, data: airports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching airports' });
  }
});

router.get('/air/track/:awbNumber', async (req, res) => {
  try {
    const tracking = await trackAirShipment(req.params.awbNumber);
    res.json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking shipment' });
  }
});

// ============================================
// TRUCK ROUTES
// ============================================
router.post('/truck/quotes', protect, async (req: any, res) => {
  try {
    const quotes = await getTruckQuotes(req.body);
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching truck quotes' });
  }
});

router.post('/truck/book', protect, async (req: any, res) => {
  try {
    const booking = await createTruckBooking(req.body);
    await query(
      `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
       VALUES ($1, $2, $3, 'Truck', $4, $5, $6, $7, $8, 'confirmed', NOW())`,
      [uuidv4(), booking.bookingId, req.user.id, req.body.originPincode, req.body.destinationPincode, req.body.cargoType, req.body.weight, req.body.bookingDate]
    );
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating truck booking' });
  }
});

router.get('/truck/track/:lrNumber', async (req, res) => {
  try {
    const tracking = await trackTruckShipment(req.params.lrNumber);
    res.json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking shipment' });
  }
});

// ============================================
// CUSTOMS ROUTES
// ============================================
router.post('/customs/quote', protect, async (req: any, res) => {
  try {
    const quote = await getCustomsQuote(req.body);
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching customs quote' });
  }
});

router.post('/customs/file', protect, async (req: any, res) => {
  try {
    const filing = await fileCustomsDeclaration(req.body);
    await query(
      `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
       VALUES ($1, $2, $3, 'Customs', $4, $5, $6, $7, NOW(), 'filed', NOW())`,
      [uuidv4(), filing.filingId, req.user.id, req.body.countryOfOrigin, req.body.portOfEntry, req.body.cargoType, req.body.weight]
    );
    res.json({ success: true, data: filing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error filing customs declaration' });
  }
});

router.get('/customs/status/:beNumber', async (req, res) => {
  try {
    const status = await getCustomsStatus(req.params.beNumber);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching customs status' });
  }
});

router.get('/customs/hscode/:hsCode', async (req, res) => {
  try {
    const details = await getHSCodeDetails(req.params.hsCode);
    res.json({ success: true, data: details });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching HS code details' });
  }
});

// ============================================
// PORT ROUTES
// ============================================
router.post('/port/quote', protect, async (req: any, res) => {
  try {
    const quote = await getPortServiceQuote(req.body);
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching port quote' });
  }
});

router.post('/port/book', protect, async (req: any, res) => {
  try {
    const booking = await createPortBooking(req.body);
    await query(
      `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
       VALUES ($1, $2, $3, 'Port', $4, $4, $5, $6, $7, 'confirmed', NOW())`,
      [uuidv4(), booking.bookingId, req.user.id, req.body.portCode, req.body.serviceCategory, req.body.cargoWeight || 0, req.body.arrivalDate]
    );
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating port booking' });
  }
});

router.get('/port/status/:portCallNumber', async (req, res) => {
  try {
    const status = await getPortStatus(req.params.portCallNumber);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching port status' });
  }
});

router.get('/port/list', async (req, res) => {
  try {
    const ports = await getMajorPorts();
    res.json({ success: true, data: ports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching ports' });
  }
});

// ============================================
// INSURANCE ROUTES
// ============================================
router.post('/insurance/quotes', protect, async (req: any, res) => {
  try {
    const quotes = await getInsuranceQuotes(req.body);
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching insurance quotes' });
  }
});

router.post('/insurance/policy', protect, async (req: any, res) => {
  try {
    const policy = await createInsurancePolicy(req.body);
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating insurance policy' });
  }
});

router.post('/insurance/claim', protect, async (req: any, res) => {
  try {
    const claim = await fileClaim(req.body);
    res.json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error filing claim' });
  }
});

// ============================================
// LCL ROUTES
// ============================================
router.post('/lcl/quotes', protect, async (req: any, res) => {
  try {
    const quotes = await getLCLQuotes(req.body);
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching LCL quotes' });
  }
});

router.post('/lcl/book', protect, async (req: any, res) => {
  try {
    const booking = await createLCLBooking(req.body);
    await query(
      `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
       VALUES ($1, $2, $3, 'LCL', $4, $5, $6, $7, $8, 'confirmed', NOW())`,
      [uuidv4(), booking.bookingId, req.user.id, req.body.originPort, req.body.destinationPort, req.body.cargoType, req.body.weight, req.body.bookingDate]
    );
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating LCL booking' });
  }
});

router.get('/lcl/track/:hblNumber', async (req, res) => {
  try {
    const tracking = await trackLCLShipment(req.params.hblNumber);
    res.json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking LCL shipment' });
  }
});

// ============================================
// PARCEL ROUTES
// ============================================
router.post('/parcel/quotes', protect, async (req: any, res) => {
  try {
    const quotes = await getParcelQuotes(req.body);
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching parcel quotes' });
  }
});

router.post('/parcel/book', protect, async (req: any, res) => {
  try {
    const booking = await createParcelBooking(req.body);
    await query(
      `INSERT INTO bookings (id, booking_number, user_id, service_type, origin, destination, cargo_type, weight, booking_date, status, created_at)
       VALUES ($1, $2, $3, 'Parcel', $4, $5, $6, $7, $8, 'confirmed', NOW())`,
      [uuidv4(), booking.bookingId, req.user.id, req.body.originPincode, req.body.destinationPincode, req.body.description, req.body.weight, req.body.bookingDate]
    );
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating parcel booking' });
  }
});

router.get('/parcel/track/:awbNumber', async (req, res) => {
  try {
    const tracking = await trackParcel(req.params.awbNumber);
    res.json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking parcel' });
  }
});

export default router;
