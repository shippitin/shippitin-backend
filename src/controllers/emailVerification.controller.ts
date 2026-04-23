// src/controllers/emailVerification.controller.ts
import { Request, Response } from 'express';
import { query } from '../config/database';
import { sendStatusUpdateEmail } from '../integrations/email';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/send-verification-otp
export const sendVerificationOTP = async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ success: false, message: 'User ID and email are required' });
    }

    // Check if already verified
    const userResult = await query('SELECT is_verified, full_name FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (userResult.rows[0].is_verified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous OTPs
    await query('UPDATE email_verifications SET verified = TRUE WHERE user_id = $1', [userId]);

    // Insert new OTP
    await query(
      'INSERT INTO email_verifications (user_id, email, otp, expires_at) VALUES ($1, $2, $3, $4)',
      [userId, email, otp, expiresAt]
    );

    // Send OTP email
    await sendStatusUpdateEmail(
      email,
      userResult.rows[0].full_name,
      'Email Verification',
      `Your Shippitin verification OTP is: ${otp}`,
      'Valid for 10 minutes.'
    );

    console.log(`Verification OTP sent to ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: 'Verification OTP sent to your email.',
    });
  } catch (error) {
    console.error('Send verification OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/verify-email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'User ID and OTP are required' });
    }

    // Find valid OTP
    const tokenResult = await query(
      `SELECT * FROM email_verifications 
       WHERE user_id = $1 AND otp = $2 AND verified = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [userId, otp]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Mark user as verified
    await query('UPDATE users SET is_verified = TRUE WHERE id = $1', [userId]);

    // Mark OTP as used
    await query('UPDATE email_verifications SET verified = TRUE WHERE user_id = $1', [userId]);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};