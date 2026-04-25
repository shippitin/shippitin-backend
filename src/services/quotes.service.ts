// src/services/quotes.service.ts
// ============================================
// QUOTES SERVICE — Dynamic pricing engine
// Level 1: Surge multiplier (admin controlled)
// Level 2: Peak season pricing (valid_from/valid_until + priority)
// Level 3: Demand-based auto surge (search tracking)
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
  originalPrice: number;
  surgeMultiplier: number;
  surgeReason: string | null;
  isDynamicPrice: boolean;
  validFrom: string;
  validUntil: string;
}

// ============================================
// LEVEL 3: Track search and return demand surge
// ============================================
const trackSearchAndGetDemandSurge = async (
  serviceType: string,
  origin: string,
  destination: string
): Promise<{ multiplier: number; reason: string | null }> => {
  try {
    // Upsert search count for today
    await query(
      `INSERT INTO route_searches (service_type, origin, destination, search_count, last_searched_at, date)
       VALUES ($1, $2, $3, 1, NOW(), CURRENT_DATE)
       ON CONFLICT (service_type, origin, destination, date)
       DO UPDATE SET search_count = route_searches.search_count + 1, last_searched_at = NOW()`,
      [serviceType, origin.toLowerCase(), destination.toLowerCase()]
    );

    // Get current search count
    const searchResult = await query(
      `SELECT search_count FROM route_searches 
       WHERE service_type = $1 AND LOWER(origin) = LOWER($2) AND LOWER(destination) = LOWER($3) AND date = CURRENT_DATE`,
      [serviceType, origin, destination]
    );

    const searchCount = searchResult.rows[0]?.search_count || 0;

    // Check surge rules — specific service type first, then global
    const surgeRule = await query(
      `SELECT * FROM surge_rules 
       WHERE is_active = TRUE 
       AND (service_type = $1 OR service_type IS NULL)
       AND searches_threshold <= $2
       ORDER BY searches_threshold DESC, service_type NULLS LAST
       LIMIT 1`,
      [serviceType, searchCount]
    );

    if (surgeRule.rows.length > 0) {
      const rule = surgeRule.rows[0];
      return {
        multiplier: parseFloat(rule.surge_multiplier),
        reason: `High demand: ${searchCount} searches today`
      };
    }

    return { multiplier: 1.0, reason: null };
  } catch (error) {
    console.error('Error tracking search:', error);
    return { multiplier: 1.0, reason: null };
  }
};

// ============================================
// MAIN: Get quotes with all dynamic pricing
// ============================================
export const getQuotes = async (req: QuoteRequest): Promise<QuoteResult[]> => {
  const { serviceType, origin, destination, weight, numberOfContainers, containerType } = req;

  // Level 3: Track this search and get demand surge
  const demandSurge = await trackSearchAndGetDemandSurge(serviceType, origin, destination);

  // Level 2: Get best rate cards (highest priority first, respecting valid dates)
  let result = await query(
    `SELECT * FROM rate_cards
     WHERE service_type = $1
     AND LOWER(origin) = LOWER($2)
     AND LOWER(destination) = LOWER($3)
     AND is_active = TRUE
     AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
     AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
     ORDER BY priority DESC, base_price ASC`,
    [serviceType, origin, destination]
  );

  // Fallback: partial match if no exact match
  if (result.rows.length === 0) {
    result = await query(
      `SELECT * FROM rate_cards
       WHERE service_type = $1
       AND is_active = TRUE
       AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
       AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
       ORDER BY priority DESC, base_price ASC
       LIMIT 5`,
      [serviceType]
    );
  }

  return result.rows
    .map(row => {
      // Skip if container type doesn't match
      if (containerType && row.container_type && row.container_type !== containerType) return null;

      // Calculate base total price
      let totalPrice = parseFloat(row.base_price);
      if (parseFloat(row.price_per_kg) > 0 && weight) {
        totalPrice = weight * parseFloat(row.price_per_kg);
      } else if (parseFloat(row.price_per_container) > 0 && numberOfContainers) {
        totalPrice = numberOfContainers * parseFloat(row.price_per_container);
      }

      const originalPrice = Math.round(totalPrice);

      // Level 1: Apply admin-set surge multiplier
      const adminSurge = parseFloat(row.surge_multiplier) || 1.0;
      const adminSurgeReason = row.surge_reason || null;

      // Level 3: Apply demand surge (take the higher of admin surge or demand surge)
      const finalSurge = Math.max(adminSurge, demandSurge.multiplier);
      const surgeReason = finalSurge > 1.0
        ? (adminSurgeReason || demandSurge.reason)
        : null;

      const finalPrice = Math.round(originalPrice * finalSurge);

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
        totalPrice: finalPrice,
        originalPrice,
        surgeMultiplier: finalSurge,
        surgeReason,
        isDynamicPrice: finalSurge > 1.0,
        validFrom: row.valid_from,
        validUntil: row.valid_until,
      };
    })
    .filter(Boolean) as QuoteResult[];
};

// ============================================
// ADMIN: Rate card CRUD
// ============================================
export const getAllRateCards = async () => {
  const result = await query(
    'SELECT * FROM rate_cards ORDER BY service_type, origin, destination'
  );
  return result.rows;
};

export const createRateCard = async (data: any) => {
  const result = await query(
    `INSERT INTO rate_cards (
      service_type, origin, destination, carrier, transit_time,
      base_price, price_per_kg, price_per_container, container_type,
      is_active, valid_from, valid_until, surge_multiplier, surge_reason, priority
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    RETURNING *`,
    [
      data.service_type, data.origin, data.destination, data.carrier,
      data.transit_time, data.base_price, data.price_per_kg || 0,
      data.price_per_container || 0, data.container_type || null,
      data.is_active !== false, data.valid_from || null, data.valid_until || null,
      data.surge_multiplier || 1.0, data.surge_reason || null, data.priority || 0
    ]
  );
  return result.rows[0];
};

export const updateRateCard = async (id: string, data: any) => {
  const result = await query(
    `UPDATE rate_cards SET
      service_type = $1, origin = $2, destination = $3, carrier = $4,
      transit_time = $5, base_price = $6, price_per_kg = $7,
      price_per_container = $8, container_type = $9, is_active = $10,
      valid_from = $11, valid_until = $12, surge_multiplier = $13,
      surge_reason = $14, priority = $15, updated_at = NOW()
    WHERE id = $16 RETURNING *`,
    [
      data.service_type, data.origin, data.destination, data.carrier,
      data.transit_time, data.base_price, data.price_per_kg || 0,
      data.price_per_container || 0, data.container_type || null,
      data.is_active !== false, data.valid_from || null, data.valid_until || null,
      data.surge_multiplier || 1.0, data.surge_reason || null, data.priority || 0, id
    ]
  );
  return result.rows[0];
};

export const deleteRateCard = async (id: string) => {
  await query('DELETE FROM rate_cards WHERE id = $1', [id]);
};

// ============================================
// ADMIN: Surge rules management
// ============================================
export const getSurgeRules = async () => {
  const result = await query('SELECT * FROM surge_rules ORDER BY searches_threshold ASC');
  return result.rows;
};

export const getSearchStats = async () => {
  const result = await query(
    `SELECT service_type, origin, destination, search_count, last_searched_at
     FROM route_searches
     WHERE date = CURRENT_DATE
     ORDER BY search_count DESC
     LIMIT 20`
  );
  return result.rows;
};