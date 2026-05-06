// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { getUserByEmail } from '../services/user.service';
import { emitUserRegistered } from '../services/event.service';

const JWT_SECRET         = process.env.JWT_SECRET || 'shippitin_jwt_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'shippitin_refresh_secret_key';

const generateAccessToken = (id: string, email: string, role: string) =>
  jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (id: string) =>
  jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

// ── REGISTER ────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, phone, company_name } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    const newUser = await query(
      `INSERT INTO users (id, full_name, email, password, phone, company_name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'customer', NOW())
       RETURNING id, full_name, email, phone, company_name, role`,
      [userId, full_name, email, hashedPassword, phone, company_name || null]
    );

    const user = newUser.rows[0];
    const accessToken  = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || (req.connection as any)?.remoteAddress || null;

    await query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at, user_agent, ip_address)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', NOW(), $4, $5)`,
      [uuidv4(), user.id, refreshToken, userAgent, ipAddress]
    );

    emitUserRegistered({
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, token: accessToken, refreshToken },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ── LOGIN ───────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken  = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || (req.connection as any)?.remoteAddress || null;

    await query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at, user_agent, ip_address)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', NOW(), $4, $5)`,
      [uuidv4(), user.id, refreshToken, userAgent, ipAddress]
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          company_name: user.company_name,
          role: user.role,
        },
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ── REFRESH TOKEN ───────────────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const result = await query(
      `SELECT rt.*, u.email, u.role FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 AND rt.revoked = FALSE AND rt.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Refresh token revoked or expired' });
    }

    const row = result.rows[0];
    await query('UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1', [token]);

    const newAccessToken  = generateAccessToken(row.user_id, row.email, row.role);
    const newRefreshToken = generateRefreshToken(row.user_id);

    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || (req.connection as any)?.remoteAddress || null;

    await query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at, user_agent, ip_address)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', NOW(), $4, $5)`,
      [uuidv4(), row.user_id, newRefreshToken, userAgent, ipAddress]
    );

    return res.status(200).json({
      success: true,
      data: { token: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── LOGOUT ──────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await query('UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1', [token]);
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── GET ME ──────────────────────────────────────────────────────────
export const getMe = async (req: any, res: Response) => {
  try {
    const result = await query(
      'SELECT id, full_name, email, phone, company_name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};