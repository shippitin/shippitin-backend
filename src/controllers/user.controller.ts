// src/controllers/user.controller.ts
import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, full_name, email, phone, company_name,
       gstin, address, city, state, pincode, role, created_at,
       pan_number, company_registration_id, preferred_shipment_mode,
       usual_cargo_type, preferred_load_size, carrier_license_number
       FROM users WHERE id = $1`,
      [req.user?.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const {
      full_name, phone, company_name, gstin, address, city, state, pincode,
      pan_number, company_registration_id, preferred_shipment_mode,
      usual_cargo_type, preferred_load_size, carrier_license_number,
    } = req.body;

    const result = await query(
      `UPDATE users SET
        full_name                = COALESCE($1,  full_name),
        phone                    = COALESCE($2,  phone),
        company_name             = COALESCE($3,  company_name),
        gstin                    = COALESCE($4,  gstin),
        address                  = COALESCE($5,  address),
        city                     = COALESCE($6,  city),
        state                    = COALESCE($7,  state),
        pincode                  = COALESCE($8,  pincode),
        pan_number               = COALESCE($9,  pan_number),
        company_registration_id  = COALESCE($10, company_registration_id),
        preferred_shipment_mode  = COALESCE($11, preferred_shipment_mode),
        usual_cargo_type         = COALESCE($12, usual_cargo_type),
        preferred_load_size      = COALESCE($13, preferred_load_size),
        carrier_license_number   = COALESCE($14, carrier_license_number),
        updated_at               = NOW()
       WHERE id = $15
       RETURNING id, full_name, email, phone, company_name,
       gstin, address, city, state, pincode, role,
       pan_number, company_registration_id, preferred_shipment_mode,
       usual_cargo_type, preferred_load_size, carrier_license_number`,
      [full_name, phone, company_name, gstin, address, city, state, pincode,
       pan_number, company_registration_id, preferred_shipment_mode,
       usual_cargo_type, preferred_load_size, carrier_license_number, req.user?.id]
    );
    return res.status(200).json({ success: true, message: 'Profile updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }
    const result = await query('SELECT password FROM users WHERE id = $1', [req.user?.id]);
    const isMatch = await bcrypt.compare(current_password, result.rows[0].password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, req.user?.id]);
    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT balance, currency FROM wallets WHERE user_id = $1', [req.user?.id]);
    if (result.rows.length === 0) return res.status(200).json({ success: true, data: { balance: 0, currency: 'INR' } });
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get wallet error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── SESSIONS (LoggedInDevices) ─────────────────────────────────────────────

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, user_agent, ip_address, created_at, expires_at
       FROM refresh_tokens
       WHERE user_id = $1 AND revoked = false AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [req.user?.id]
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get sessions error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const revokeSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await query(
      `UPDATE refresh_tokens SET revoked = true WHERE id = $1 AND user_id = $2`,
      [id, req.user?.id]
    );
    return res.status(200).json({ success: true, message: 'Session revoked' });
  } catch (error) {
    console.error('Revoke session error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const revokeAllSessions = async (req: AuthRequest, res: Response) => {
  try {
    await query(
      `UPDATE refresh_tokens SET revoked = true WHERE user_id = $1`,
      [req.user?.id]
    );
    return res.status(200).json({ success: true, message: 'All sessions revoked' });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── BILLING ────────────────────────────────────────────────────────────────

export const getBilling = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, service_type, origin, destination, status,
              total_amount, currency, payment_status, payment_method,
              booking_date, created_at
       FROM bookings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user?.id]
    );

    const totalSpent = result.rows
      .filter((r: any) => r.payment_status === 'paid')
      .reduce((sum: number, r: any) => sum + parseFloat(r.total_amount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        transactions: result.rows,
        summary: {
          total_spent: totalSpent,
          total_bookings: result.rows.length,
          paid_count: result.rows.filter((r: any) => r.payment_status === 'paid').length,
          pending_count: result.rows.filter((r: any) => r.payment_status === 'pending').length,
        }
      }
    });
  } catch (error) {
    console.error('Get billing error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── DOCUMENTS ─────────────────────────────────────────────────────────────

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, file_name, file_type, file_size, file_url,
              document_type, description, created_at
       FROM user_documents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user?.id]
    ).catch(() => ({ rows: [] }));

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { file_name, file_type, file_size, file_url, document_type, description } = req.body;
    if (!file_name || !file_url) {
      return res.status(400).json({ success: false, message: 'file_name and file_url are required' });
    }
    const result = await query(
      `INSERT INTO user_documents (user_id, file_name, file_type, file_size, file_url, document_type, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user?.id, file_name, file_type, file_size, file_url, document_type || 'other', description || '']
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM user_documents WHERE id = $1 AND user_id = $2`, [id, req.user?.id]);
    return res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};