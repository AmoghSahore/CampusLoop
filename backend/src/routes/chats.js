import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { getChatConversations } from '../controllers/chatController.js';

const router = Router();

// GET /api/chats — list distinct conversations for current user
router.get('/', authMiddleware, getChatConversations);

export default router;
