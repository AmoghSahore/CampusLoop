import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { getProfile, getUserListings } from '../controllers/userController.js';

const router = Router();

// All user routes require authentication — the middleware verifies the JWT
// and sets req.user before the controller runs
router.get('/profile', authMiddleware, getProfile);
router.get('/listings', authMiddleware, getUserListings);

export default router;
