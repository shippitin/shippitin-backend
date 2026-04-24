import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { createBooking, getUserBookings, getBookingById as getBookingByIdService, cancelBooking as cancelBookingService } from '../services/booking.service';
import { emitBookingCreated } from '../services/event.service';

export const createBookingHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { booking_number, service_type, origin, destination, cargo_type, weight, container_type, booking_date, special_instructions, estimated_price, status } = req.body;

    if (!service_type || !origin || !destination || !booking_date) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const bookingNumber = booking_number || `SHP${Date.now()}${Math.floor(Math.random() * 10000)}`;

    const booking = await createBooking({
      userId: req.user?.id,
      bookingNumber,
      serviceType: service_type,
      origin,
      destination,
      cargoType: cargo_type || 'General',
      weight: weight || 0,
      containerType: container_type || null,
      bookingDate: booking_date,
      estimatedPrice: estimated_price || 0,
      specialInstructions: special_instructions || null,
      status: status || 'pending',
    });

    const userResult = await query('SELECT full_name, email, phone FROM users WHERE id = $1', [req.user?.id]);

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      emitBookingCreated({
        bookingId: booking.id,
        bookingNumber,
        userId: req.user?.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        serviceType: service_type,
        origin,
        destination,
        estimatedPrice: estimated_price || 0,
        bookingDate: booking_date,
      });
    }

    return res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating booking' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await getUserBookings(req.user?.id);
    return res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching bookings' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await getBookingByIdService(req.params.id, req.user?.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching booking' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await cancelBookingService(req.params.id, req.user?.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found or cannot be cancelled' });
    return res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error while cancelling booking' });
  }
};