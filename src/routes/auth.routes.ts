import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { forgotPassword, resetPassword } from '../controllers/forgotPassword.controller';
import { protect } from '../middleware/auth.middleware';
import { registerValidator, loginValidator, validate } from '../middleware/validate.middleware';

const router = Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;