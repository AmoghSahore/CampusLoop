import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import checkActiveStatus from '../middleware/checkActiveStatus.js';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const router = Router();

// POST /api/messages — Send a message
// Requires JWT auth + ACTIVE status
router.post('/', authMiddleware, checkActiveStatus, sendMessage);

// GET /api/messages/:product_id/:user_id — Get conversation
// Requires JWT auth
router.get('/:product_id/:user_id', authMiddleware, getMessages);

export default router;
