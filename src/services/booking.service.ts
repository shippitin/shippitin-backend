// src/services/booking.service.ts
// ============================================
// BOOKING SERVICE — Only this service touches booking tables
// Controllers must go through this service
// ============================================

import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateBookingData {
  userId: string;
  bookingNumber: string;
  serviceType: string;
  origin: string;
  destination: string;
  cargoType: string;
  weight: number;
  containerType?: string;
  bookingDate: string;
  estimatedPrice: number;
  specialInstructions?: string;
  status?: string;
}

export interface BookingFilters {
  userId?: string;
  status?: string;
  serviceType?: string;
  limit?: number;
  offset?: number;
}

// Create a new booking
export const createBooking = async (data: CreateBookingData) => {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO bookings (
      id, user_id, booking_number, service_type, origin, destination,
      cargo_type, weight, container_type, booking_date, estimated_price,
      special_instructions, status, created_at, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())
    RETURNING *`,
    [
      id, data.userId, data.bookingNumber, data.serviceType,
      data.origin, data.destination, data.cargoType, data.weight,
      data.containerType || null, data.bookingDate, data.estimatedPrice,
      data.specialInstructions || null, data.status || 'pending',
    ]
  );
  return result.rows[0];
};

// Get all bookings for a user
export const getUserBookings = async (userId: string) => {
  const result = await query(
    `SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

// Get a single booking by ID
export const getBookingById = async (bookingId: string, userId?: string) => {
  const result = userId
    ? await query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [bookingId, userId])
    : await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
  return result.rows[0] || null;
};

// Get booking by booking number
export const getBookingByNumber = async (bookingNumber: string) => {
  const result = await query(
    'SELECT * FROM bookings WHERE booking_number = $1',
    [bookingNumber]
  );
  return result.rows[0] || null;
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: string) => {
  const result = await query(
    `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, bookingId]
  );
  return result.rows[0] || null;
};

// Cancel a booking
export const cancelBooking = async (bookingId: string, userId: string) => {
  const result = await query(
    `UPDATE bookings SET status = 'cancelled', updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND status != 'delivered'
     RETURNING *`,
    [bookingId, userId]
  );
  return result.rows[0] || null;
};

// Get all bookings (admin only)
export const getAllBookings = async (filters: BookingFilters = {}) => {
  const result = await query(
    `SELECT b.*, u.full_name, u.email 
     FROM bookings b 
     JOIN users u ON b.user_id = u.id 
     ORDER BY b.created_at DESC
     LIMIT $1 OFFSET $2`,
    [filters.limit || 100, filters.offset || 0]
  );
  return result.rows;
};

// Get booking stats (admin only)
export const getBookingStats = async () => {
  const [total, pending, confirmed, delivered, cancelled] = await Promise.all([
    query('SELECT COUNT(*) FROM bookings'),
    query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'"),
    query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'"),
    query("SELECT COUNT(*) FROM bookings WHERE status = 'delivered'"),
    query("SELECT COUNT(*) FROM bookings WHERE status = 'cancelled'"),
  ]);
  return {
    totalBookings: parseInt(total.rows[0].count),
    pendingBookings: parseInt(pending.rows[0].count),
    confirmedBookings: parseInt(confirmed.rows[0].count),
    deliveredBookings: parseInt(delivered.rows[0].count),
    cancelledBookings: parseInt(cancelled.rows[0].count),
  };
};