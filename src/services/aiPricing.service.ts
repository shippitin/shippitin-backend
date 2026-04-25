// src/services/aiPricing.service.ts
// ============================================
// AI PRICING ENGINE — Automatic dynamic pricing
// Runs every hour and adjusts prices based on:
// 1. Search demand patterns
// 2. Time of day / day of week
// 3. Seasonal factors
// 4. Booking conversion rates
// ============================================

import cron from 'node-cron';
import { query } from '../config/database';

interface PricingDecision {
  rateCardId: string;
  serviceType: string;
  origin: string;
  destination: string;
  carrier: string;
  oldMultiplier: number;
  newMultiplier: number;
  reason: string;
}

// ============================================
// FACTOR 1: Demand-based pricing
// ============================================
const getDemandFactor = async (
  serviceType: string,
  origin: string,
  destination: string
): Promise<{ factor: number; reason: string }> => {
  const result = await query(
    `SELECT search_count FROM route_searches 
     WHERE service_type = $1 AND LOWER(origin) = LOWER($2) AND LOWER(destination) = LOWER($3) 
     AND date = CURRENT_DATE`,
    [serviceType, origin, destination]
  );

  const searchCount = result.rows[0]?.search_count || 0;

  if (searchCount >= 200) return { factor: 1.30, reason: 'Extreme demand: 200+ searches today' };
  if (searchCount >= 100) return { factor: 1.20, reason: 'Very high demand: 100+ searches today' };
  if (searchCount >= 50)  return { factor: 1.10, reason: 'High demand: 50+ searches today' };
  if (searchCount >= 20)  return { factor: 1.05, reason: 'Moderate demand: 20+ searches today' };
  if (searchCount <= 2)   return { factor: 0.95, reason: 'Low demand: discount applied' };

  return { factor: 1.0, reason: 'Normal demand' };
};

// ============================================
// FACTOR 2: Time of day pricing
// ============================================
const getTimeOfDayFactor = (): { factor: number; reason: string } => {
  const hour = new Date().getHours();
  const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday

  // Weekend pricing
  if (day === 0 || day === 6) {
    return { factor: 0.95, reason: 'Weekend discount' };
  }

  // Peak business hours (9am - 6pm IST)
  if (hour >= 9 && hour <= 18) {
    return { factor: 1.05, reason: 'Peak business hours' };
  }

  // Off hours discount
  if (hour < 7 || hour > 21) {
    return { factor: 0.97, reason: 'Off-hours discount' };
  }

  return { factor: 1.0, reason: 'Normal hours' };
};

// ============================================
// FACTOR 3: Seasonal pricing
// ============================================
const getSeasonalFactor = (): { factor: number; reason: string } => {
  const month = new Date().getMonth() + 1; // 1-12
  const day = new Date().getDate();

  // Pre-Diwali surge (Oct-Nov)
  if (month === 10 || (month === 11 && day <= 15)) {
    return { factor: 1.15, reason: 'Pre-Diwali peak season' };
  }

  // Pre-Christmas / New Year surge (Dec)
  if (month === 12) {
    return { factor: 1.12, reason: 'Year-end peak season' };
  }

  // Financial year end surge (Mar)
  if (month === 3) {
    return { factor: 1.08, reason: 'Financial year-end surge' };
  }

  // Post-festive slowdown (Jan-Feb)
  if (month === 1 || month === 2) {
    return { factor: 0.95, reason: 'Post-festive discount' };
  }

  // Monsoon slowdown for trucking (Jul-Aug)
  if (month === 7 || month === 8) {
    return { factor: 1.05, reason: 'Monsoon season adjustment' };
  }

  return { factor: 1.0, reason: 'Normal season' };
};

// ============================================
// FACTOR 4: Booking conversion rate
// ============================================
const getConversionFactor = async (
  serviceType: string,
  origin: string,
  destination: string
): Promise<{ factor: number; reason: string }> => {
  try {
    // Check bookings in last 7 days vs searches
    const bookings = await query(
      `SELECT COUNT(*) FROM bookings 
       WHERE service_type = $1 AND LOWER(origin) = LOWER($2) AND LOWER(destination) = LOWER($3)
       AND created_at >= NOW() - INTERVAL '7 days'`,
      [serviceType, origin, destination]
    );

    const searches = await query(
      `SELECT SUM(search_count) FROM route_searches
       WHERE service_type = $1 AND LOWER(origin) = LOWER($2) AND LOWER(destination) = LOWER($3)
       AND date >= CURRENT_DATE - INTERVAL '7 days'`,
      [serviceType, origin, destination]
    );

    const bookingCount = parseInt(bookings.rows[0]?.count || '0');
    const searchCount = parseInt(searches.rows[0]?.sum || '0');

    if (searchCount === 0) return { factor: 1.0, reason: 'No data' };

    const conversionRate = bookingCount / searchCount;

    // High conversion = people are willing to pay → increase price
    if (conversionRate > 0.3) return { factor: 1.08, reason: 'High conversion rate' };
    // Low conversion = price might be too high → decrease
    if (conversionRate < 0.05 && searchCount > 20) return { factor: 0.95, reason: 'Low conversion: price adjustment' };

    return { factor: 1.0, reason: 'Normal conversion' };
  } catch (error) {
    return { factor: 1.0, reason: 'No data' };
  }
};

// ============================================
// MAIN: Calculate and apply AI pricing
// ============================================
const runAIPricingEngine = async (): Promise<void> => {
  console.log('[AI PRICING] Running pricing engine...');
  const decisions: PricingDecision[] = [];

  try {
    // Get all active rate cards
    const rateCards = await query(
      'SELECT * FROM rate_cards WHERE is_active = TRUE'
    );

    for (const rate of rateCards.rows) {
      // Get all factors
      const [demandFactor, timeOfDayFactor, seasonalFactor, conversionFactor] = await Promise.all([
        getDemandFactor(rate.service_type, rate.origin, rate.destination),
        Promise.resolve(getTimeOfDayFactor()),
        Promise.resolve(getSeasonalFactor()),
        getConversionFactor(rate.service_type, rate.origin, rate.destination),
      ]);

      // Combine all factors (weighted average)
      const combinedMultiplier = (
        demandFactor.factor * 0.40 +      // Demand = 40% weight
        seasonalFactor.factor * 0.30 +    // Season = 30% weight
        conversionFactor.factor * 0.20 +  // Conversion = 20% weight
        timeOfDayFactor.factor * 0.10     // Time = 10% weight
      );

      // Round to 2 decimal places
      const newMultiplier = Math.round(combinedMultiplier * 100) / 100;

      // Cap between 0.8x and 1.5x to prevent extreme pricing
      const cappedMultiplier = Math.min(Math.max(newMultiplier, 0.80), 1.50);

      const oldMultiplier = parseFloat(rate.surge_multiplier) || 1.0;

      // Only update if change is significant (>2%)
      if (Math.abs(cappedMultiplier - oldMultiplier) > 0.02) {
        // Build reason string
        const reasons = [];
        if (demandFactor.factor !== 1.0) reasons.push(demandFactor.reason);
        if (seasonalFactor.factor !== 1.0) reasons.push(seasonalFactor.reason);
        if (conversionFactor.factor !== 1.0) reasons.push(conversionFactor.reason);
        if (timeOfDayFactor.factor !== 1.0) reasons.push(timeOfDayFactor.reason);

        const surgeReason = reasons.length > 0 ? reasons.join(', ') : null;

        // Update rate card
        await query(
          `UPDATE rate_cards SET surge_multiplier = $1, surge_reason = $2, updated_at = NOW()
           WHERE id = $3`,
          [cappedMultiplier, surgeReason, rate.id]
        );

        decisions.push({
          rateCardId: rate.id,
          serviceType: rate.service_type,
          origin: rate.origin,
          destination: rate.destination,
          carrier: rate.carrier,
          oldMultiplier,
          newMultiplier: cappedMultiplier,
          reason: surgeReason || 'Normal pricing',
        });
      }
    }

    if (decisions.length > 0) {
      console.log(`[AI PRICING] Updated ${decisions.length} rate cards:`);
      decisions.forEach(d => {
        console.log(`  ${d.serviceType} ${d.origin}→${d.destination} (${d.carrier}): ${d.oldMultiplier}x → ${d.newMultiplier}x | ${d.reason}`);
      });
    } else {
      console.log('[AI PRICING] No significant price changes needed.');
    }

    // Log to database
    await query(
      `INSERT INTO pricing_logs (decisions_count, created_at) VALUES ($1, NOW())
       ON CONFLICT DO NOTHING`,
      [decisions.length]
    ).catch(() => {}); // Ignore if table doesn't exist yet

  } catch (error) {
    console.error('[AI PRICING] Error:', error);
  }
};

// ============================================
// SCHEDULER: Run every hour
// ============================================
export const startAIPricingEngine = (): void => {
  console.log('[AI PRICING] Starting AI pricing engine...');

  // Run immediately on startup
  runAIPricingEngine();

  // Then run every hour
  cron.schedule('0 * * * *', async () => {
    await runAIPricingEngine();
  });

  // Also run every 15 minutes for demand tracking only (lighter job)
  cron.schedule('*/15 * * * *', async () => {
    console.log('[AI PRICING] 15-min demand check running...');
    await runAIPricingEngine();
  });

  console.log('[AI PRICING] Scheduled: runs every 15 minutes');
};

export default runAIPricingEngine;