// ============================================
// PAYMENT INTEGRATION — RAZORPAY (REAL)
// ============================================

import Razorpay from 'razorpay';
import crypto from 'crypto';

const getRazorpayInstance = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

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

export const createPaymentOrder = async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
  const razorpay = getRazorpayInstance();
  const order = await razorpay.orders.create({
    amount: Math.round(request.amount * 100), // Razorpay takes paise
    currency: request.currency || 'INR',
    receipt: request.bookingId,
    notes: request.notes || {},
  });

  return {
    orderId: order.id,
    amount: request.amount,
    currency: request.currency || 'INR',
    keyId: process.env.RAZORPAY_KEY_ID || '',
  };
};

export const verifyPayment = async (request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
  const body = request.razorpay_order_id + '|' + request.razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body.toString())
    .digest('hex');

  const verified = expectedSignature === request.razorpay_signature;

  return {
    verified,
    paymentId: request.razorpay_payment_id,
    orderId: request.razorpay_order_id,
  };
};

export const refundPayment = async (paymentId: string, amount: number): Promise<{ refundId: string; status: string }> => {
  const razorpay = getRazorpayInstance();
  const refund = await razorpay.payments.refund(paymentId, {
    amount: Math.round(amount * 100),
  });

  return {
    refundId: refund.id,
    status: refund.status,
  };
};