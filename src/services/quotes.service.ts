// src/services/quotes.service.ts
// ============================================
// QUOTES SERVICE — Fetches real rates from database
// ============================================

import { query } from '../config/database';

export interface QuoteRequest {
  serviceType: string;
  origin: string;
  destination: string;
  weight?: number;
  numberOfContainers?: number;
  containerType?: string;
}

export interface QuoteResult {
  id: string;
  serviceType: string;
  carrier: string;
  origin: string;
  destination: string;
  transitTime: string;
  basePrice: number;
  pricePerKg: number;
  pricePerContainer: number;
  containerType: string | null;
  totalPrice: number;
  validFrom: string;
  validUntil: string;
}

// Get quotes from rate cards
export const getQuotes = async (req: QuoteRequest): Promise<QuoteResult[]> => {
  const { serviceType, origin, destination, weight, numberOfContainers, containerType } = req;

  // Try exact match first, then fuzzy match
  let result = await query(
    `SELECT * FROM rate_cards
     WHERE service_type = $1
     AND LOWER(origin) = LOWER($2)
     AND LOWER(destination) = LOWER($3)
     AND is_active = TRUE
     AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
     ORDER BY base_price ASC`,
    [serviceType, origin, destination]
  );

  // If no exact match, try partial match
  if (result.rows.length === 0) {
    result = await query(
      `SELECT * FROM rate_cards
       WHERE service_type = $1
       AND is_active = TRUE
       AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
       ORDER BY base_price ASC
       LIMIT 5`,
      [serviceType]
    );
  }

  // Calculate total price for each rate card
  return result.rows.map(row => {
    let totalPrice = row.base_price;

    if (row.price_per_kg > 0 && weight) {
      totalPrice = weight * row.price_per_kg;
    } else if (row.price_per_container > 0 && numberOfContainers) {
      totalPrice = numberOfContainers * row.price_per_container;
    }

    // Filter by container type if specified
    if (containerType && row.container_type && row.container_type !== containerType) {
      return null;
    }

    return {
      id: row.id,
      serviceType: row.service_type,
      carrier: row.carrier,
      origin: row.origin,
      destination: row.destination,
      transitTime: row.transit_time,
      basePrice: parseFloat(row.base_price),
      pricePerKg: parseFloat(row.price_per_kg),
      pricePerContainer: parseFloat(row.price_per_container),
      containerType: row.container_type,
      totalPrice: Math.round(totalPrice),
      validFrom: row.valid_from,
      validUntil: row.valid_until,
    };
  }).filter(Boolean) as QuoteResult[];
};

// Get all rate cards (admin only)
export const getAllRateCards = async () => {
  const result = await query(
    'SELECT * FROM rate_cards ORDER BY service_type, origin, destination',
  );
  return result.rows;
};

// Create rate card (admin only)
export const createRateCard = async (data: any) => {
  const result = await query(
    `INSERT INTO rate_cards (
      service_type, origin, destination, carrier, transit_time,
      base_price, price_per_kg, price_per_container, container_type,
      is_active, valid_from, valid_until
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [
      data.service_type, data.origin, data.destination, data.carrier,
      data.transit_time, data.base_price, data.price_per_kg || 0,
      data.price_per_container || 0, data.container_type || null,
      data.is_active !== false, data.valid_from || null, data.valid_until || null
    ]
  );
  return result.rows[0];
};

// Update rate card (admin only)
export const updateRateCard = async (id: string, data: any) => {
  const result = await query(
    `UPDATE rate_cards SET
      service_type = $1, origin = $2, destination = $3, carrier = $4,
      transit_time = $5, base_price = $6, price_per_kg = $7,
      price_per_container = $8, container_type = $9, is_active = $10,
      valid_from = $11, valid_until = $12, updated_at = NOW()
    WHERE id = $13 RETURNING *`,
    [
      data.service_type, data.origin, data.destination, data.carrier,
      data.transit_time, data.base_price, data.price_per_kg || 0,
      data.price_per_container || 0, data.container_type || null,
      data.is_active !== false, data.valid_from || null, data.valid_until || null, id
    ]
  );
  return result.rows[0];
};

// Delete rate card (admin only)
export const deleteRateCard = async (id: string) => {
  await query('DELETE FROM rate_cards WHERE id = $1', [id]);
};