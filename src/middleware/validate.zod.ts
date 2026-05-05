// src/middleware/validate.zod.ts
// ============================================
// ZOD VALIDATION SCHEMAS — All route inputs
// Usage: router.post('/path', validateBody(schema), asyncHandler(...))
// ============================================

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ── Middleware factory ──────────────────────────────────────────────
export const validateBody = (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: result.error.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    req.body = result.data; // use parsed/coerced data
    next();
  };

export const validateQuery = (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: result.error.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    req.query = result.data as any;
    next();
  };

// ── AUTH ────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  full_name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:        z.string().email('Invalid email address'),
  password:     z.string().min(6, 'Password must be at least 6 characters'),
  phone:        z.string().min(10, 'Phone must be at least 10 digits'),
  company_name: z.string().optional(),
});

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password:     z.string().min(6, 'New password must be at least 6 characters'),
});

// ── BOOKINGS ────────────────────────────────────────────────────────
export const createBookingSchema = z.object({
  booking_number:       z.string().optional(),
  service_type:         z.string().min(1, 'Service type is required'),
  origin:               z.string().min(1, 'Origin is required'),
  destination:          z.string().min(1, 'Destination is required'),
  cargo_type:           z.string().optional(),
  weight:               z.number().nonnegative().optional(),
  container_type:       z.string().optional(),
  booking_date:         z.string().min(1, 'Booking date is required'),
  estimated_price:      z.number().nonnegative().optional(),
  special_instructions: z.string().optional(),
  status:               z.string().optional(),
});

// ── USER PROFILE ────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  full_name:                z.string().min(2).optional(),
  phone:                    z.string().min(10).optional(),
  company_name:             z.string().optional(),
  gstin:                    z.string().optional(),
  address:                  z.string().optional(),
  city:                     z.string().optional(),
  state:                    z.string().optional(),
  pincode:                  z.string().optional(),
  pan_number:               z.string().max(10).optional(),
  company_registration_id:  z.string().optional(),
  preferred_shipment_mode:  z.string().optional(),
  usual_cargo_type:         z.string().optional(),
  preferred_load_size:      z.string().optional(),
  carrier_license_number:   z.string().optional(),
});

// ── RAIL ────────────────────────────────────────────────────────────
export const railQuoteSchema = z.object({
  origin:             z.string().min(1, 'Origin is required'),
  destination:        z.string().min(1, 'Destination is required'),
  cargoType:          z.string().optional(),
  weight:             z.number().nonnegative().optional(),
  numberOfContainers: z.number().int().positive().optional(),
  containerType:      z.string().optional(),
  bookingDate:        z.string().optional(),
});

export const railBookSchema = z.object({
  origin:             z.string().min(1),
  destination:        z.string().min(1),
  cargoType:          z.string().optional(),
  weight:             z.number().nonnegative().optional(),
  bookingDate:        z.string().min(1, 'Booking date is required'),
  numberOfContainers: z.number().int().positive().optional(),
  containerType:      z.string().optional(),
});

// ── SEA ─────────────────────────────────────────────────────────────
export const seaQuoteSchema = z.object({
  originPort:         z.string().min(1, 'Origin port is required'),
  destinationPort:    z.string().min(1, 'Destination port is required'),
  cargoType:          z.string().optional(),
  weight:             z.number().nonnegative().optional(),
  numberOfContainers: z.number().int().positive().optional(),
  containerType:      z.string().optional(),
});

export const seaBookSchema = z.object({
  originPort:         z.string().min(1),
  destinationPort:    z.string().min(1),
  cargoType:          z.string().optional(),
  weight:             z.number().nonnegative().optional(),
  bookingDate:        z.string().min(1),
  numberOfContainers: z.number().int().positive().optional(),
  containerType:      z.string().optional(),
});

// ── AIR ─────────────────────────────────────────────────────────────
export const airQuoteSchema = z.object({
  originAirport:      z.string().min(1, 'Origin airport is required'),
  destinationAirport: z.string().min(1, 'Destination airport is required'),
  weight:             z.number().nonnegative().optional(),
  cargoType:          z.string().optional(),
});

export const airBookSchema = z.object({
  originAirport:      z.string().min(1),
  destinationAirport: z.string().min(1),
  cargoType:          z.string().optional(),
  weight:             z.number().nonnegative().optional(),
  bookingDate:        z.string().min(1),
});

// ── TRUCK ───────────────────────────────────────────────────────────
export const truckQuoteSchema = z.object({
  originPincode:      z.string().min(1, 'Origin is required'),
  destinationPincode: z.string().min(1, 'Destination is required'),
  weight:             z.number().nonnegative().optional(),
  cargoType:          z.string().optional(),
  loadType:           z.enum(['PTL', 'FTL']).optional(),
});

export const truckBookSchema = z.object({
  originPincode:      z.string().min(1),
  destinationPincode: z.string().min(1),
  cargoType:          z.string().optional(),
  weight:             z.number().nonnegative().optional(),
  bookingDate:        z.string().min(1),
});

// ── PORT ────────────────────────────────────────────────────────────
export const portQuoteSchema = z.object({
  portCode:             z.string().min(1, 'Port code is required'),
  serviceCategory:      z.string().min(1, 'Service category is required'),
  vesselName:           z.string().min(1, 'Vessel name is required'),
  vesselType:           z.string().optional(),
  grt:                  z.number().nonnegative().optional(),
  arrivalDate:          z.string().min(1, 'Arrival date is required'),
  departureDate:        z.string().optional(),
  specificRequirements: z.string().optional(),
});

export const portBookSchema = z.object({
  portCode:        z.string().min(1),
  serviceCategory: z.string().min(1),
  vesselName:      z.string().min(1),
  vesselType:      z.string().optional(),
  grt:             z.number().nonnegative().optional(),
  arrivalDate:     z.string().min(1),
  departureDate:   z.string().optional(),
  cargoWeight:     z.number().nonnegative().optional(),
  customerDetails: z.object({
    name:   z.string().optional(),
    email:  z.string().email().optional(),
    mobile: z.string().optional(),
    gstin:  z.string().optional(),
  }).optional(),
});

// ── CUSTOMS ─────────────────────────────────────────────────────────
export const customsQuoteSchema = z.object({
  countryOfOrigin: z.string().min(1, 'Country of origin is required'),
  portOfEntry:     z.string().min(1, 'Port of entry is required'),
  cargoType:       z.string().optional(),
  weight:          z.number().nonnegative().optional(),
  hsCode:          z.string().optional(),
  cargoValue:      z.number().nonnegative().optional(),
});

// ── INSURANCE ───────────────────────────────────────────────────────
export const insuranceQuoteSchema = z.object({
  cargoType:    z.string().min(1, 'Cargo type is required'),
  cargoValue:   z.number().positive('Cargo value must be positive'),
  origin:       z.string().min(1, 'Origin is required'),
  destination:  z.string().min(1, 'Destination is required'),
  shipmentMode: z.string().optional(),
});

// ── LCL ─────────────────────────────────────────────────────────────
export const lclQuoteSchema = z.object({
  originPort:      z.string().min(1, 'Origin port is required'),
  destinationPort: z.string().min(1, 'Destination port is required'),
  weight:          z.number().nonnegative().optional(),
  volume:          z.number().nonnegative().optional(),
  cargoType:       z.string().optional(),
});

// ── PARCEL ──────────────────────────────────────────────────────────
export const parcelQuoteSchema = z.object({
  originPincode:      z.string().min(1, 'Origin pincode is required'),
  destinationPincode: z.string().min(1, 'Destination pincode is required'),
  weight:             z.number().positive('Weight must be positive'),
  dimensions:         z.object({
    length: z.number().optional(),
    width:  z.number().optional(),
    height: z.number().optional(),
  }).optional(),
});

// ── RATE CARDS ──────────────────────────────────────────────────────
export const rateCardSearchSchema = z.object({
  serviceType:        z.string().min(1, 'Service type is required'),
  origin:             z.string().min(1, 'Origin is required'),
  destination:        z.string().min(1, 'Destination is required'),
  weight:             z.coerce.number().nonnegative().optional(),
  numberOfContainers: z.coerce.number().int().positive().optional(),
  containerType:      z.string().optional(),
});

export const rateCardCreateSchema = z.object({
  service_type:       z.string().min(1),
  origin:             z.string().min(1),
  destination:        z.string().min(1),
  carrier:            z.string().min(1),
  transit_time:       z.string().min(1),
  base_price:         z.number().nonnegative(),
  price_per_kg:       z.number().nonnegative().optional(),
  price_per_container:z.number().nonnegative().optional(),
  container_type:     z.string().optional(),
  is_active:          z.boolean().optional(),
  valid_from:         z.string().optional(),
  valid_until:        z.string().optional(),
  surge_multiplier:   z.number().min(0.5).max(3).optional(),
  surge_reason:       z.string().optional(),
  priority:           z.number().int().optional(),
});