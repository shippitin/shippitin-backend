// src/services/user.service.ts
// ============================================
// USER SERVICE — Only this service touches user tables
// ============================================

import { query } from '../config/database';

export interface UpdateUserData {
  full_name?: string;
  phone?: string;
  company_name?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
}

// Get user by ID
export const getUserById = async (userId: string) => {
  const result = await query(
    'SELECT id, full_name, email, phone, company_name, role, created_at FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

// Get user by email
export const getUserByEmail = async (email: string) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

// Update user profile
export const updateUser = async (userId: string, data: UpdateUserData) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (data.full_name !== undefined) { fields.push(`full_name = $${idx++}`); values.push(data.full_name); }
  if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
  if (data.company_name !== undefined) { fields.push(`company_name = $${idx++}`); values.push(data.company_name); }
  if (data.gstin !== undefined) { fields.push(`gstin = $${idx++}`); values.push(data.gstin); }
  if (data.address !== undefined) { fields.push(`address = $${idx++}`); values.push(data.address); }
  if (data.city !== undefined) { fields.push(`city = $${idx++}`); values.push(data.city); }
  if (data.state !== undefined) { fields.push(`state = $${idx++}`); values.push(data.state); }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, full_name, email, phone, company_name, role`,
    values
  );
  return result.rows[0] || null;
};

// Update user password
export const updateUserPassword = async (userId: string, hashedPassword: string) => {
  await query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
    [hashedPassword, userId]
  );
};

// Get all users (admin only)
export const getAllUsers = async () => {
  const result = await query(
    'SELECT id, full_name, email, phone, company_name, role, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

// Make user admin
export const makeUserAdmin = async (userId: string) => {
  const result = await query(
    `UPDATE users SET role = 'admin' WHERE id = $1 RETURNING id, full_name, email, role`,
    [userId]
  );
  return result.rows[0] || null;
};

// Get user count (admin only)
export const getUserCount = async () => {
  const result = await query('SELECT COUNT(*) FROM users');
  return parseInt(result.rows[0].count);
};
