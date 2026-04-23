import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { sendWelcomeEmail } from '../integrations/email';
import { sendWelcomeSMS } from '../integrations/sms';

const generateToken = (id: string, email: string, role: string) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET || 'shippitin_jwt_secret_key',
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, phone, company_name } = req.body;

    if (!full_name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
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
    const token = generateToken(user.id, user.email, user.role);

    // Send welcome email
    sendWelcomeEmail(email, full_name).catch(err => console.error('Email error:', err));

    // Send welcome SMS
    sendWelcomeSMS(phone, full_name).catch(err => console.error('SMS error:', err));

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, token },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user.id, user.email, user.role);

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
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const result = await query(
      'SELECT id, full_name, email, phone, company_name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
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
    console.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};