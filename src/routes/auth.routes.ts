// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login, getMe, refreshToken, logout } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody, registerSchema, loginSchema } from '../middleware/validate.zod';
import { z } from 'zod';

const router = Router();

const refreshSchema = z.object({ refreshToken: z.string().min(1, 'Refresh token required') });

router.post('/register', validateBody(registerSchema), asyncHandler(register));
router.post('/login',    validateBody(loginSchema),    asyncHandler(login));
router.post('/refresh',  validateBody(refreshSchema),  asyncHandler(refreshToken));
router.post('/logout',                                  asyncHandler(logout));
router.get('/me',        protect,                       asyncHandler(getMe));

export default router;