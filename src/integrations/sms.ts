// ============================================
// SMS INTEGRATION — MSG91
// ============================================

import axios from 'axios';

const getSMSClient = () => axios.create({
  baseURL: 'https://api.msg91.com/api/v5',
  headers: {
    'authkey': process.env.MSG91_AUTH_KEY || '',
    'Content-Type': 'application/json',
  },
});

const SENDER_ID = process.env.MSG91_SENDER_ID || 'SHPTIN';
const ROUTE = process.env.MSG91_ROUTE || '4';

// Send welcome SMS after registration
export const sendWelcomeSMS = async (mobile: string, name: string) => {
  try {
    await getSMSClient().post('/flow/', {
      sender: SENDER_ID,
      route: ROUTE,
      country: '91',
      sms: [
        {
          message: `Welcome to Shippitin, ${name}! Your account is ready. Book rail, sea, air & truck freight all in one place. - Shippitin Logistics`,
          to: [mobile],
        },
      ],
    });
    console.log(`Welcome SMS sent to ${mobile}`);
  } catch (error) {
    console.error('Failed to send welcome SMS:', error);
  }
};

// Send booking confirmation SMS
export const sendBookingConfirmationSMS = async (
  mobile: string,
  bookingNumber: string,
  serviceType: string,
  origin: string,
  destination: string
) => {
  try {
    await getSMSClient().post('/flow/', {
      sender: SENDER_ID,
      route: ROUTE,
      country: '91',
      sms: [
        {
          message: `Shippitin: Booking ${bookingNumber} confirmed! ${serviceType} from ${origin} to ${destination}. Track at shippitin.co/track`,
          to: [mobile],
        },
      ],
    });
    console.log(`Booking confirmation SMS sent to ${mobile}`);
  } catch (error) {
    console.error('Failed to send booking confirmation SMS:', error);
  }
};

// Send status update SMS
export const sendStatusUpdateSMS = async (
  mobile: string,
  bookingNumber: string,
  status: string,
  location: string
) => {
  try {
    await getSMSClient().post('/flow/', {
      sender: SENDER_ID,
      route: ROUTE,
      country: '91',
      sms: [
        {
          message: `Shippitin: Your shipment ${bookingNumber} is now ${status} at ${location}. Track at shippitin.co/track`,
          to: [mobile],
        },
      ],
    });
    console.log(`Status update SMS sent to ${mobile}`);
  } catch (error) {
    console.error('Failed to send status update SMS:', error);
  }
};

// Send OTP SMS
export const sendOTPSMS = async (mobile: string, otp: string) => {
  try {
    await getSMSClient().post('/flow/', {
      sender: SENDER_ID,
      route: ROUTE,
      country: '91',
      sms: [
        {
          message: `Your Shippitin OTP is ${otp}. Valid for 10 minutes. Do not share with anyone. - Shippitin Logistics`,
          to: [mobile],
        },
      ],
    });
    console.log(`OTP SMS sent to ${mobile}`);
  } catch (error) {
    console.error('Failed to send OTP SMS:', error);
  }
};