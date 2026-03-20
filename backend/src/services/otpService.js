import crypto from 'crypto';

export const OTP_LENGTH = 6;
export const OTP_EXPIRE_MINUTES = Number(process.env.OTP_EXPIRE_MINUTES) || 10;
export const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 5;
export const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60;
export const OTP_MAX_RESENDS = Number(process.env.OTP_MAX_RESENDS) || 5;

export const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = (10 ** OTP_LENGTH) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

export const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
};
