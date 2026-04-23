import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware';
import { query } from '../config/database';

const router = Router();

// All admin routes require login + admin role
router.use(protect, adminOnly);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, full_name, email, phone, company_name, role, created_at 
       FROM users ORDER BY created_at DESC`
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*, u.full_name, u.email 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       ORDER BY b.created_at DESC`
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [users, bookings, pending, confirmed, delivered, cancelled] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COUNT(*) FROM bookings'),
      query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'"),
      query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'"),
      query("SELECT COUNT(*) FROM bookings WHERE status = 'delivered'"),
      query("SELECT COUNT(*) FROM bookings WHERE status = 'cancelled'"),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(users.rows[0].count),
        totalBookings: parseInt(bookings.rows[0].count),
        pendingBookings: parseInt(pending.rows[0].count),
        confirmedBookings: parseInt(confirmed.rows[0].count),
        deliveredBookings: parseInt(delivered.rows[0].count),
        cancelledBookings: parseInt(cancelled.rows[0].count),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update booking status
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Status updated', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Make user admin
router.put('/users/:id/make-admin', async (req, res) => {
  try {
    const result = await query(
      `UPDATE users SET role = 'admin' WHERE id = $1 RETURNING id, full_name, email, role`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User is now admin', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;