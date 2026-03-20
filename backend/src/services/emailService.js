import nodemailer from 'nodemailer';

const hasSmtpConfig = () => {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};

const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const shouldFallbackToDevLog = () => String(process.env.NODE_ENV || 'development') !== 'production';

const sendMailWithFallback = async ({ transport, mailOptions, fallbackLog }) => {
  try {
    await transport.sendMail(mailOptions);
    return { delivered: true, mode: 'smtp' };
  } catch (error) {
    if (!shouldFallbackToDevLog()) {
      throw error;
    }
    console.warn(`${fallbackLog} SMTP delivery failed: ${error.message}`);
    return { delivered: false, mode: 'dev-log' };
  }
};

export const sendOtpEmail = async ({ to, name, otp, expiresMinutes }) => {
  if (!hasSmtpConfig()) {
    console.warn(`[DEV OTP] Email config missing. OTP for ${to}: ${otp} (expires in ${expiresMinutes} minutes)`);
    return { delivered: false, mode: 'dev-log' };
  }

  const transport = createTransport();

  const subject = 'CampusLoop - Verify your email';
  const text = `Hi ${name || 'there'},\n\nYour CampusLoop verification code is: ${otp}\nThis code expires in ${expiresMinutes} minutes.\n\nIf you did not create this account, you can ignore this email.\n\n- CampusLoop`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;max-width:560px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">Verify your CampusLoop account</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Your verification code is:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;padding:12px 16px;background:#f3f4f6;border-radius:10px;display:inline-block;">
        ${otp}
      </div>
      <p style="margin-top:16px;">This code expires in <strong>${expiresMinutes} minutes</strong>.</p>
      <p style="color:#6b7280;">If you did not create this account, you can ignore this email.</p>
    </div>
  `;

  return sendMailWithFallback({
    transport,
    mailOptions: {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
    },
    fallbackLog: `[DEV OTP] OTP for ${to}: ${otp} (expires in ${expiresMinutes} minutes).`,
  });
};

export const sendListingStatusOtpEmail = async ({ to, name, otp, expiresMinutes, listingTitle, nextStatus }) => {
  if (!hasSmtpConfig()) {
    console.warn(`[DEV LISTING OTP] Email config missing. OTP for ${to}: ${otp} (${listingTitle} -> ${nextStatus}, expires in ${expiresMinutes} minutes)`);
    return { delivered: false, mode: 'dev-log' };
  }

  const transport = createTransport();

  const subject = `CampusLoop - Confirm listing status ${nextStatus}`;
  const text = `Hi ${name || 'there'},\n\nUse this OTP to confirm marking your listing "${listingTitle}" as ${nextStatus}: ${otp}\nThis code expires in ${expiresMinutes} minutes.\n\nIf you did not request this action, ignore this email.\n\n- CampusLoop`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;max-width:560px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">Confirm listing completion</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Use this OTP to mark your listing <strong>${listingTitle}</strong> as <strong>${nextStatus}</strong>:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;padding:12px 16px;background:#f3f4f6;border-radius:10px;display:inline-block;">
        ${otp}
      </div>
      <p style="margin-top:16px;">This code expires in <strong>${expiresMinutes} minutes</strong>.</p>
      <p style="color:#6b7280;">If you did not request this action, ignore this email.</p>
    </div>
  `;

  return sendMailWithFallback({
    transport,
    mailOptions: {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
    },
    fallbackLog: `[DEV LISTING OTP] OTP for ${to}: ${otp} (${listingTitle} -> ${nextStatus}, expires in ${expiresMinutes} minutes).`,
  });
};
