import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getWallet,
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { changePasswordValidator, validate } from '../middleware/validate.middleware';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePasswordValidator, validate, changePassword);
router.get('/wallet', getWallet);

export default router;