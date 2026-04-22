import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';

// Middleware to check validation results
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validators
export const registerValidator = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// Booking validators
export const bookingValidator = [
  body('service_type')
    .notEmpty().withMessage('Service type is required'),
  body('origin')
    .trim()
    .notEmpty().withMessage('Origin is required'),
  body('destination')
    .trim()
    .notEmpty().withMessage('Destination is required'),
  body('booking_date')
    .notEmpty().withMessage('Booking date is required')
    .isDate().withMessage('Please provide a valid date'),
];

// Password change validators
export const changePasswordValidator = [
  body('current_password')
    .notEmpty().withMessage('Current password is required'),
  body('new_password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];