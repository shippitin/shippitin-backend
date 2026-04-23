// src/services/payment.service.ts
// ============================================
// PAYMENT SERVICE — Only this service touches wallet tables
// ============================================

import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Get wallet by user ID
export const getWalletByUserId = async (userId: string) => {
  const result = await query(
    'SELECT * FROM wallets WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
};

// Create wallet for new user
export const createWallet = async (userId: string) => {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO wallets (id, user_id, balance, created_at) 
     VALUES ($1, $2, 0, NOW()) RETURNING *`,
    [id, userId]
  );
  return result.rows[0];
};

// Add wallet transaction
export const addWalletTransaction = async (
  userId: string,
  amount: number,
  type: 'credit' | 'debit',
  description: string
) => {
  const result = await query(
    `INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, created_at)
     SELECT gen_random_uuid(), w.id, $1, $2, $3, NOW()
     FROM wallets w WHERE w.user_id = $4
     RETURNING *`,
    [amount, type, description, userId]
  );
  return result.rows[0] || null;
};

// Get wallet transactions
export const getWalletTransactions = async (userId: string) => {
  const result = await query(
    `SELECT wt.* FROM wallet_transactions wt
     JOIN wallets w ON wt.wallet_id = w.id
     WHERE w.user_id = $1
     ORDER BY wt.created_at DESC`,
    [userId]
  );
  return result.rows;
};

// Update wallet balance
export const updateWalletBalance = async (userId: string, amount: number, type: 'credit' | 'debit') => {
  const operator = type === 'credit' ? '+' : '-';
  const result = await query(
    `UPDATE wallets SET balance = balance ${operator} $1, updated_at = NOW()
     WHERE user_id = $2 RETURNING *`,
    [amount, userId]
  );
  return result.rows[0] || null;
};
