import { Router } from 'express';
import { signup, login } from '../controllers/authController.js';

const router = Router();

// POST /api/auth/signup  — create a new user account
router.post('/signup', signup);

// POST /api/auth/login   — authenticate and receive a JWT
router.post('/login', login);

export default router;
