// ============================================
// PAYMENT INTEGRATION — RAZORPAY
// ============================================
// When Razorpay account is ready:
// - Add RAZORPAY_KEY_ID to .env
// - Add RAZORPAY_KEY_SECRET to .env
// - Uncomment real Razorpay code
// ============================================

import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

export interface CreateOrderRequest {
  amount: number; // in INR
  currency: string;
  bookingId: string;
  userId: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  paymentId: string;
  orderId: string;
}

// ============================================
// STUB FUNCTIONS — Replace with real Razorpay
// ============================================

export const createPaymentOrder = async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
  // TODO: Replace with real Razorpay API call
  // const Razorpay = require('razorpay');
  // const razorpay = new Razorpay({
  //   key_id: RAZORPAY_KEY_ID,
  //   key_secret: RAZORPAY_KEY_SECRET,
  // });
  // const order = await razorpay.orders.create({
  //   amount: request.amount * 100, // Razorpay takes paise
  //   currency: request.currency || 'INR',
  //   receipt: request.bookingId,
  //   notes: request.notes || {},
  // });
  // return {
  //   orderId: order.id,
  //   amount: request.amount,
  //   currency: request.currency,
  //   keyId: RAZORPAY_KEY_ID,
  // };

  return {
    orderId: `order_${Date.now()}`,
    amount: request.amount,
    currency: request.currency || 'INR',
    keyId: RAZORPAY_KEY_ID,
  };
};

export const verifyPayment = async (request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
  // TODO: Replace with real Razorpay verification
  // const body = request.razorpay_order_id + '|' + request.razorpay_payment_id;
  // const expectedSignature = crypto
  //   .createHmac('sha256', RAZORPAY_KEY_SECRET)
  //   .update(body.toString())
  //   .digest('hex');
  // const verified = expectedSignature === request.razorpay_signature;

  // For now return true (stub)
  return {
    verified: true,
    paymentId: request.razorpay_payment_id,
    orderId: request.razorpay_order_id,
  };
};

export const refundPayment = async (paymentId: string, amount: number): Promise<{ refundId: string; status: string }> => {
  // TODO: Replace with real Razorpay refund
  // const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  // const refund = await razorpay.payments.refund(paymentId, { amount: amount * 100 });
  // return { refundId: refund.id, status: refund.status };

  return {
    refundId: `refund_${Date.now()}`,
    status: 'processed',
  };
};