import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { createPaymentOrder, verifyPayment, refundPayment } from '../integrations/payment';
import { query } from '../config/database';

const router = Router();

// Create payment order
router.post('/create-order', protect, async (req: any, res) => {
  try {
    const { amount, bookingId, currency } = req.body;

    if (!amount || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and booking ID are required',
      });
    }

    const order = await createPaymentOrder({
      amount,
      currency: currency || 'INR',
      bookingId,
      userId: req.user.id,
      notes: {
        bookingId,
        userId: req.user.id,
      },
    });

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
    });
  }
});

// Verify payment after user completes payment
router.post('/verify', protect, async (req: any, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const result = await verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (result.verified) {
      // Update booking status to confirmed
      await query(
        `UPDATE bookings SET status = 'confirmed', updated_at = NOW() WHERE id = $1`,
        [bookingId]
      );

      // Add wallet transaction
      await query(
        `INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, created_at)
         SELECT gen_random_uuid(), w.id, $1, 'debit', $2, NOW()
         FROM wallets w WHERE w.user_id = $3`,
        [req.body.amount, `Payment for booking ${bookingId}`, req.user.id]
      );

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
    });
  }
});

// Refund payment
router.post('/refund', protect, async (req: any, res) => {
  try {
    const { paymentId, amount, bookingId } = req.body;

    const refund = await refundPayment(paymentId, amount);

    // Update booking status
    await query(
      `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [bookingId]
    );

    return res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: refund,
    });
  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process refund',
    });
  }
});

// Get payment status
router.get('/status/:bookingId', protect, async (req: any, res) => {
  try {
    const result = await query(
      `SELECT status, estimated_price FROM bookings WHERE id = $1 AND user_id = $2`,
      [req.params.bookingId, req.user.id]
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
    console.error('Payment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
    });
  }
});

export default router;