// ============================================
// EMAIL INTEGRATION — BREVO (via REST API)
// ============================================

import axios from 'axios';

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'shippitinindia@gmail.com';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Shippitin Logistics';

const getBrevoClient = () => axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key': process.env.BREVO_API_KEY || '',
    'Content-Type': 'application/json',
  },
});

export const sendWelcomeEmail = async (toEmail: string, toName: string) => {
  try {
    await getBrevoClient().post('/smtp/email', {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: toEmail, name: toName }],
      subject: 'Welcome to Shippitin Logistics!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1d4ed8; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">SHIPPITIN</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Welcome, ${toName}!</h2>
            <p>Your Shippitin account has been created successfully.</p>
            <p>You can now book freight services across Rail, Sea, Air, Truck and more — all in one platform.</p>
            <a href="http://shippitin.co" style="background: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
              Start Booking
            </a>
          </div>
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Shippitin Logistics Private Limited</p>
          </div>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

export const sendBookingConfirmationEmail = async (
  toEmail: string,
  toName: string,
  bookingDetails: {
    bookingNumber: string;
    serviceType: string;
    origin: string;
    destination: string;
    bookingDate: string;
    estimatedPrice: number;
  }
) => {
  try {
    await getBrevoClient().post('/smtp/email', {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: toEmail, name: toName }],
      subject: `Booking Confirmed — ${bookingDetails.bookingNumber}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1d4ed8; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">SHIPPITIN</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Booking Confirmed!</h2>
            <p>Dear ${toName},</p>
            <p>Your booking has been confirmed. Here are your details:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%;">
                <tr><td style="color: #6b7280; padding: 8px 0;">Booking ID</td><td style="font-weight: bold;">${bookingDetails.bookingNumber}</td></tr>
                <tr><td style="color: #6b7280; padding: 8px 0;">Service</td><td>${bookingDetails.serviceType}</td></tr>
                <tr><td style="color: #6b7280; padding: 8px 0;">From</td><td>${bookingDetails.origin}</td></tr>
                <tr><td style="color: #6b7280; padding: 8px 0;">To</td><td>${bookingDetails.destination}</td></tr>
                <tr><td style="color: #6b7280; padding: 8px 0;">Date</td><td>${bookingDetails.bookingDate}</td></tr>
                <tr><td style="color: #6b7280; padding: 8px 0;">Amount</td><td style="font-weight: bold;">₹${bookingDetails.estimatedPrice.toLocaleString('en-IN')}</td></tr>
              </table>
            </div>
            <a href="http://shippitin.co/my-bookings" style="background: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Booking
            </a>
          </div>
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Shippitin Logistics Private Limited</p>
          </div>
        </div>
      `,
    });
    console.log(`Booking confirmation email sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
  }
};

export const sendStatusUpdateEmail = async (
  toEmail: string,
  toName: string,
  bookingNumber: string,
  status: string,
  location: string
) => {
  try {
    await getBrevoClient().post('/smtp/email', {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: toEmail, name: toName }],
      subject: `Shipment Update — ${bookingNumber}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1d4ed8; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">SHIPPITIN</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Shipment Update</h2>
            <p>Dear ${toName},</p>
            <p>Your shipment <strong>${bookingNumber}</strong> status has been updated.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Status:</strong> ${status}</p>
              <p><strong>Current Location:</strong> ${location}</p>
            </div>
            <a href="http://shippitin.co/track?id=${bookingNumber}" style="background: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Track Shipment
            </a>
          </div>
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Shippitin Logistics Private Limited</p>
          </div>
        </div>
      `,
    });
    console.log(`Status update email sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send status update email:', error);
  }
};