import { Request, Response } from 'express';
import { query } from '../config/database';

export const trackShipment = async (req: Request, res: Response) => {
  try {
    const { bookingNumber } = req.params;

    const result = await query(
      `SELECT 
        b.booking_number,
        b.service_type,
        b.origin,
        b.destination,
        b.status,
        b.booking_date,
        b.created_at,
        t.location,
        t.status as tracking_status,
        t.description,
        t.timestamp
       FROM bookings b
       LEFT JOIN tracking_events t ON b.id = t.booking_id
       WHERE b.booking_number = $1
       ORDER BY t.timestamp DESC`,
      [bookingNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found',
      });
    }

    const booking = {
      booking_number: result.rows[0].booking_number,
      service_type: result.rows[0].service_type,
      origin: result.rows[0].origin,
      destination: result.rows[0].destination,
      status: result.rows[0].status,
      booking_date: result.rows[0].booking_date,
      created_at: result.rows[0].created_at,
      tracking_events: result.rows
        .filter((row) => row.tracking_status !== null)
        .map((row) => ({
          location: row.location,
          status: row.tracking_status,
          description: row.description,
          timestamp: row.timestamp,
        })),
    };

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Track shipment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while tracking shipment',
    });
  }
};

export const addTrackingEvent = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { location, status, description } = req.body;

    if (!location || !status || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide location, status and description',
      });
    }

    const result = await query(
      `INSERT INTO tracking_events (id, booking_id, location, status, description, timestamp)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
       RETURNING *`,
      [bookingId, location, status, description]
    );

    await query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, bookingId]
    );

    return res.status(201).json({
      success: true,
      message: 'Tracking event added',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Add tracking event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding tracking event',
    });
  }
};