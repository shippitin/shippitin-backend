import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getWallet,
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All user routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/wallet', getWallet);

export default router;