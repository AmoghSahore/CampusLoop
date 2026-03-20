import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import checkActiveStatus from '../middleware/checkActiveStatus.js';
import { submitReport } from '../controllers/reportController.js';

const router = Router();

router.post('/', authMiddleware, checkActiveStatus, submitReport);

export default router;
