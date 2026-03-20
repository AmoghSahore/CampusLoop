import { Router } from 'express';
import { adminLogin } from '../controllers/adminAuthController.js';
import { adminLoginLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/login', adminLoginLimiter, adminLogin);

export default router;
