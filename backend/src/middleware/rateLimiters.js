import { createRateLimiter } from './rateLimit.js';

const parseEnv = (name, fallback) => Number(process.env[name]) || fallback;

export const authLoginLimiter = createRateLimiter({
  windowMs: parseEnv('RL_AUTH_LOGIN_WINDOW_MS', 60_000),
  max: parseEnv('RL_AUTH_LOGIN_MAX', 10),
  message: 'Too many login attempts. Please wait before trying again.',
});

export const authOtpVerifyLimiter = createRateLimiter({
  windowMs: parseEnv('RL_AUTH_VERIFY_WINDOW_MS', 60_000),
  max: parseEnv('RL_AUTH_VERIFY_MAX', 12),
  message: 'Too many OTP verification attempts. Please try again shortly.',
});

export const authOtpResendLimiter = createRateLimiter({
  windowMs: parseEnv('RL_AUTH_RESEND_WINDOW_MS', 60_000),
  max: parseEnv('RL_AUTH_RESEND_MAX', 6),
  message: 'Too many OTP resend requests. Please try again shortly.',
});

export const adminLoginLimiter = createRateLimiter({
  windowMs: parseEnv('RL_ADMIN_LOGIN_WINDOW_MS', 60_000),
  max: parseEnv('RL_ADMIN_LOGIN_MAX', 8),
  message: 'Too many admin login attempts. Please wait before trying again.',
});

export const statusOtpRequestLimiter = createRateLimiter({
  windowMs: parseEnv('RL_STATUS_REQUEST_WINDOW_MS', 60_000),
  max: parseEnv('RL_STATUS_REQUEST_MAX', 8),
  keyGenerator: (req) => req.user?.userId || req.ip,
  message: 'Too many status OTP requests. Please wait before trying again.',
});

export const statusOtpConfirmLimiter = createRateLimiter({
  windowMs: parseEnv('RL_STATUS_CONFIRM_WINDOW_MS', 60_000),
  max: parseEnv('RL_STATUS_CONFIRM_MAX', 12),
  keyGenerator: (req) => req.user?.userId || req.ip,
  message: 'Too many status OTP confirmations. Please try again shortly.',
});
