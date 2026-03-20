import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { submitAppeal, getMyAppeals } from '../controllers/appealController.js';

const router = Router();

router.post('/', authMiddleware, submitAppeal);
router.get('/me', authMiddleware, getMyAppeals);

export default router;
