// src/routes/user.routes.ts
import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getWallet,
  getSessions,
  revokeSession,
  revokeAllSessions,
  getBilling,
  getDocuments,
  uploadDocument,
  deleteDocument,
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { changePasswordValidator, validate } from '../middleware/validate.middleware';

const router = Router();

router.use(protect);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePasswordValidator, validate, changePassword);

// Wallet
router.get('/wallet', getWallet);

// Sessions (LoggedInDevices)
router.get('/sessions', getSessions);
router.delete('/sessions/:id', revokeSession);
router.delete('/sessions', revokeAllSessions);

// Billing
router.get('/billing', getBilling);

// Documents
router.get('/documents', getDocuments);
router.post('/documents', uploadDocument);
router.delete('/documents/:id', deleteDocument);

export default router;