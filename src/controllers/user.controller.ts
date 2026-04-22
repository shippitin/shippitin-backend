import { Request, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, full_name, email, phone, company_name, 
       gstin, address, city, state, pincode, role, created_at 
       FROM users WHERE id = $1`,
      [req.user?.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const {
      full_name,
      phone,
      company_name,
      gstin,
      address,
      city,
      state,
      pincode,
    } = req.body;

    const result = await query(
      `UPDATE users SET
        full_name = COALESCE($1, full_name),
        phone = COALESCE($2, phone),
        company_name = COALESCE($3, company_name),
        gstin = COALESCE($4, gstin),
        address = COALESCE($5, address),
        city = COALESCE($6, city),
        state = COALESCE($7, state),
        pincode = COALESCE($8, pincode),
        updated_at = NOW()
       WHERE id = $9
       RETURNING id, full_name, email, phone, company_name,
       gstin, address, city, state, pincode, role`,
      [
        full_name,
        phone,
        company_name,
        gstin,
        address,
        city,
        state,
        pincode,
        req.user?.id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    const result = await query(
      `SELECT password FROM users WHERE id = $1`,
      [req.user?.id]
    );

    const isMatch = await bcrypt.compare(
      current_password,
      result.rows[0].password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await query(
      `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
      [hashedPassword, req.user?.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while changing password',
    });
  }
};

export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT balance, currency FROM wallets WHERE user_id = $1`,
      [req.user?.id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: { balance: 0, currency: 'INR' },
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wallet',
    });
  }
};