// src/controllers/forgotPassword.controller.ts
import { Request, Response } from 'express';
import { query } from '../config/database';
import { sendStatusUpdateEmail } from '../integrations/email';
import bcrypt from 'bcryptjs';

// Generate 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user exists
    const userResult = await query('SELECT id, full_name FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // Don't reveal if email exists for security
      return res.status(200).json({ success: true, message: 'If this email exists, an OTP has been sent.' });
    }

    const user = userResult.rows[0];
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous tokens
    await query('UPDATE password_reset_tokens SET used = TRUE WHERE email = $1', [email]);

    // Insert new token
    await query(
      'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    // Send OTP email using sendStatusUpdateEmail(toEmail, toName, bookingNumber, status, location)
    await sendStatusUpdateEmail(
      email,
      user.full_name,
      'Password Reset',
      `Your OTP is: ${otp} — Valid for 10 minutes.`,
      'Do not share this OTP with anyone.'
    );

    console.log(`Password reset OTP for ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: 'If this email exists, an OTP has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Find valid token
    const tokenResult = await query(
      `SELECT * FROM password_reset_tokens 
       WHERE email = $1 AND token = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    await query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

    // Mark token as used
    await query('UPDATE password_reset_tokens SET used = TRUE WHERE email = $1', [email]);

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};