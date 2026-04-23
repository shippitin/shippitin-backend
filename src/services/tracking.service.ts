// src/services/tracking.service.ts
// ============================================
// TRACKING SERVICE — Only this service touches tracking tables
// ============================================

import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface TrackingEventData {
  bookingId: string;
  status: string;
  location: string;
  description?: string;
  coordinates?: { lat: number; lng: number };
}

// Add tracking event
export const addTrackingEvent = async (data: TrackingEventData) => {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO tracking_events (id, booking_id, status, location, description, timestamp)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
    [id, data.bookingId, data.status, data.location, data.description || null]
  );
  return result.rows[0];
};

// Get tracking events for a booking
export const getTrackingEvents = async (bookingId: string) => {
  const result = await query(
    `SELECT * FROM tracking_events WHERE booking_id = $1 ORDER BY timestamp DESC`,
    [bookingId]
  );
  return result.rows;
};

// Get tracking by booking number
export const getTrackingByBookingNumber = async (bookingNumber: string) => {
  const result = await query(
    `SELECT b.*, 
     json_agg(te.* ORDER BY te.timestamp DESC) FILTER (WHERE te.id IS NOT NULL) as tracking_events
     FROM bookings b
     LEFT JOIN tracking_events te ON te.booking_id = b.id
     WHERE b.booking_number = $1
     GROUP BY b.id`,
    [bookingNumber]
  );
  return result.rows[0] || null;
};

// Get latest tracking event
export const getLatestTrackingEvent = async (bookingId: string) => {
  const result = await query(
    `SELECT * FROM tracking_events WHERE booking_id = $1 ORDER BY timestamp DESC LIMIT 1`,
    [bookingId]
  );
  return result.rows[0] || null;
};
