// src/services/event.service.ts
// ============================================
// EVENT SERVICE — Decoupled event-driven communication
// Modules communicate through events, not direct calls
// This makes the app microservices-ready
// ============================================

import { EventEmitter } from 'events';
import { sendWelcomeEmail, sendBookingConfirmationEmail, sendStatusUpdateEmail } from '../integrations/email';
import { sendWelcomeSMS, sendBookingConfirmationSMS, sendStatusUpdateSMS } from '../integrations/sms';

// Global event emitter instance
const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(20);

// ============================================
// EVENT TYPES
// ============================================
export const EVENTS = {
  USER_REGISTERED: 'user:registered',
  BOOKING_CREATED: 'booking:created',
  BOOKING_STATUS_UPDATED: 'booking:status_updated',
  BOOKING_CANCELLED: 'booking:cancelled',
  PAYMENT_COMPLETED: 'payment:completed',
  PAYMENT_FAILED: 'payment:failed',
};

// ============================================
// EVENT INTERFACES
// ============================================
interface UserRegisteredEvent {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
}

interface BookingCreatedEvent {
  bookingId: string;
  bookingNumber: string;
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  serviceType: string;
  origin: string;
  destination: string;
  estimatedPrice: number;
  bookingDate: string;
}

interface BookingStatusUpdatedEvent {
  bookingId: string;
  bookingNumber: string;
  email: string;
  fullName: string;
  phone: string;
  status: string;
  location: string;
}

// ============================================
// EVENT LISTENERS — Notification Module
// ============================================

// When user registers → send welcome email + SMS
eventEmitter.on(EVENTS.USER_REGISTERED, async (data: UserRegisteredEvent) => {
  console.log(`[EVENT] User registered: ${data.email}`);
  try {
    await sendWelcomeEmail(data.email, data.fullName);
  } catch (error) {
    console.error('[EVENT] Welcome email failed:', error);
  }
  try {
    await sendWelcomeSMS(data.phone, data.fullName);
  } catch (error) {
    console.error('[EVENT] Welcome SMS failed:', error);
  }
});

// When booking created → send confirmation email + SMS
eventEmitter.on(EVENTS.BOOKING_CREATED, async (data: BookingCreatedEvent) => {
  console.log(`[EVENT] Booking created: ${data.bookingNumber}`);
  try {
    await sendBookingConfirmationEmail(data.email, data.fullName, {
      bookingNumber: data.bookingNumber,
      serviceType: data.serviceType,
      origin: data.origin,
      destination: data.destination,
      bookingDate: data.bookingDate,
      estimatedPrice: data.estimatedPrice,
    });
  } catch (error) {
    console.error('[EVENT] Booking confirmation email failed:', error);
  }
  try {
    await sendBookingConfirmationSMS(data.phone, data.bookingNumber, data.serviceType, data.origin, data.destination);
  } catch (error) {
    console.error('[EVENT] Booking confirmation SMS failed:', error);
  }
});

// When booking status updated → send status update email + SMS
eventEmitter.on(EVENTS.BOOKING_STATUS_UPDATED, async (data: BookingStatusUpdatedEvent) => {
  console.log(`[EVENT] Booking status updated: ${data.bookingNumber} → ${data.status}`);
  try {
    await sendStatusUpdateEmail(data.email, data.fullName, data.bookingNumber, data.status, data.location);
  } catch (error) {
    console.error('[EVENT] Status update email failed:', error);
  }
  try {
    await sendStatusUpdateSMS(data.phone, data.bookingNumber, data.status, data.location);
  } catch (error) {
    console.error('[EVENT] Status update SMS failed:', error);
  }
});

// ============================================
// EMIT FUNCTIONS — Controllers use these
// ============================================

export const emitUserRegistered = (data: UserRegisteredEvent) => {
  eventEmitter.emit(EVENTS.USER_REGISTERED, data);
};

export const emitBookingCreated = (data: BookingCreatedEvent) => {
  eventEmitter.emit(EVENTS.BOOKING_CREATED, data);
};

export const emitBookingStatusUpdated = (data: BookingStatusUpdatedEvent) => {
  eventEmitter.emit(EVENTS.BOOKING_STATUS_UPDATED, data);
};

export const emitPaymentCompleted = (data: any) => {
  eventEmitter.emit(EVENTS.PAYMENT_COMPLETED, data);
};

export default eventEmitter;
