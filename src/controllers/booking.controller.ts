import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const {
      service_type,
      origin,
      destination,
      cargo_type,
      weight,
      container_type,
      number_of_containers,
      booking_date,
      special_instructions,
      estimated_price,
    } = req.body;

    if (!service_type || !origin || !destination || !booking_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const bookingId = uuidv4();
    const bookingNumber = `SHP${Date.now()}`;

    const newBooking = await query(
      `INSERT INTO bookings (
        id, booking_number, user_id, service_type, origin, destination,
        cargo_type, weight, container_type, number_of_containers,
        booking_date, special_instructions, estimated_price, status, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending',NOW())
      RETURNING *`,
      [
        bookingId,
        bookingNumber,
        req.user?.id,
        service_type,
        origin,
        destination,
        cargo_type || null,
        weight || null,
        container_type || null,
        number_of_containers || 1,
        booking_date,
        special_instructions || null,
        estimated_price || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking.rows[0],
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
    });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user?.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
    });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM bookings WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user?.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching booking',
    });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `UPDATE bookings SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'pending'
       RETURNING *`,
      [req.params.id, req.user?.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or cannot be cancelled',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking',
    });
  }
};