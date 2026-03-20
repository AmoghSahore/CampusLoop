import { Router } from 'express';
import { signup, login, verifyOtp, resendOtp } from '../controllers/authController.js';
import {
	authLoginLimiter,
	authOtpVerifyLimiter,
	authOtpResendLimiter,
} from '../middleware/rateLimiters.js';

const router = Router();

// POST /api/auth/signup  — create a new user account
router.post('/signup', signup);

// POST /api/auth/login   — authenticate and receive a JWT
router.post('/login', authLoginLimiter, login);

// POST /api/auth/verify-otp — verify signup OTP
router.post('/verify-otp', authOtpVerifyLimiter, verifyOtp);

// POST /api/auth/resend-otp — resend verification OTP
router.post('/resend-otp', authOtpResendLimiter, resendOtp);

export default router;
