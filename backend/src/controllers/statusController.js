import pool from '../config/db.js';
import { generateOtp, hashOtp } from '../services/otpService.js';
import { sendListingStatusOtpEmail } from '../services/emailService.js';

const STATUS_OTP_EXPIRE_MINUTES = Number(process.env.STATUS_OTP_EXPIRE_MINUTES) || 10;
const STATUS_OTP_MAX_ATTEMPTS = Number(process.env.STATUS_OTP_MAX_ATTEMPTS) || 5;
const STATUS_OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.STATUS_OTP_RESEND_COOLDOWN_SECONDS) || 60;
const STATUS_OTP_MAX_RESENDS = Number(process.env.STATUS_OTP_MAX_RESENDS) || 10;

const validateTargetStatus = (status) => {
  const nextStatus = String(status || '').toUpperCase();
  if (!['SOLD', 'DONATED'].includes(nextStatus)) {
    return null;
  }
  return nextStatus;
};

const getOwnedAvailableProduct = async (productId, userId) => {
  const [rows] = await pool.execute(
    `SELECT p.product_id, p.seller_id, p.status, p.title, u.email AS seller_email, u.name AS seller_name
     FROM products p
     JOIN users u ON u.user_id = p.seller_id
     WHERE p.product_id = ?`,
    [productId]
  );

  if (rows.length === 0) {
    return { error: { code: 404, message: 'Product not found' } };
  }

  const product = rows[0];
  if (product.seller_id !== userId) {
    return { error: { code: 403, message: 'You can only update status for your own products' } };
  }

  if (product.status !== 'AVAILABLE') {
    return {
      error: {
        code: 400,
        message: `Invalid status transition from ${product.status}`,
      },
    };
  }

  return { product };
};

export const requestProductStatusOtp = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const nextStatus = validateTargetStatus(status);
    if (!nextStatus) {
      return res.status(400).json({ message: 'Invalid status. Must be SOLD or DONATED' });
    }

    const lookup = await getOwnedAvailableProduct(id, userId);
    if (lookup.error) {
      return res.status(lookup.error.code).json({ message: lookup.error.message });
    }
    const { product } = lookup;

    const [existingRows] = await pool.execute(
      `SELECT resend_count, last_sent_at
       FROM listing_completion_otps
       WHERE product_id = ?
       LIMIT 1`,
      [id]
    );

    if (existingRows.length > 0) {
      const existing = existingRows[0];
      const lastSentAt = existing.last_sent_at ? new Date(existing.last_sent_at).getTime() : 0;
      const cooldownMs = STATUS_OTP_RESEND_COOLDOWN_SECONDS * 1000;
      const timeLeft = Math.ceil((lastSentAt + cooldownMs - Date.now()) / 1000);

      if (timeLeft > 0) {
        return res.status(429).json({
          message: `Please wait ${timeLeft}s before requesting another OTP.`,
          retryAfterSeconds: timeLeft,
        });
      }

      if (existing.resend_count >= STATUS_OTP_MAX_RESENDS) {
        return res.status(429).json({ message: 'OTP resend limit reached for this listing.' });
      }
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    await pool.execute(
      `INSERT INTO listing_completion_otps
        (product_id, seller_id, pending_status, otp_hash, expires_at, attempts, resend_count, last_sent_at, consumed_at)
       VALUES
        (?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE), 0, 1, UTC_TIMESTAMP(), NULL)
       ON DUPLICATE KEY UPDATE
        seller_id = VALUES(seller_id),
        pending_status = VALUES(pending_status),
        otp_hash = VALUES(otp_hash),
        expires_at = VALUES(expires_at),
        attempts = 0,
        consumed_at = NULL,
        resend_count = resend_count + 1,
        last_sent_at = UTC_TIMESTAMP()`,
      [id, userId, nextStatus, otpHash, STATUS_OTP_EXPIRE_MINUTES]
    );

    try {
      await sendListingStatusOtpEmail({
        to: product.seller_email,
        name: product.seller_name,
        otp,
        expiresMinutes: STATUS_OTP_EXPIRE_MINUTES,
        listingTitle: product.title,
        nextStatus,
      });
    } catch (mailErr) {
      console.error('Listing status OTP email error:', mailErr);
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    return res.status(200).json({
      message: `OTP sent to your email for marking listing as ${nextStatus}`,
      status: nextStatus,
      expiresInMinutes: STATUS_OTP_EXPIRE_MINUTES,
    });
  } catch (err) {
    console.error('Request product status OTP error:', err);
    return res.status(500).json({ message: 'Server error requesting status OTP' });
  }
};

export const confirmProductStatusWithOtp = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { status, otp } = req.body;
    const userId = req.user.userId;

    const nextStatus = validateTargetStatus(status);
    if (!nextStatus) {
      return res.status(400).json({ message: 'Invalid status. Must be SOLD or DONATED' });
    }

    if (!otp || !/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({ message: 'A valid 6-digit OTP is required' });
    }

    await connection.beginTransaction();

    const [productRows] = await connection.execute(
      'SELECT product_id, seller_id, status FROM products WHERE product_id = ? FOR UPDATE',
      [id]
    );

    if (productRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productRows[0];
    if (product.seller_id !== userId) {
      await connection.rollback();
      return res.status(403).json({ message: 'You can only update status for your own products' });
    }

    if (product.status !== 'AVAILABLE') {
      await connection.rollback();
      return res.status(400).json({ message: `Invalid status transition from ${product.status}` });
    }

    const [otpRows] = await connection.execute(
      `SELECT otp_id, otp_hash, pending_status, expires_at, attempts, consumed_at
       FROM listing_completion_otps
       WHERE product_id = ? AND seller_id = ?
       LIMIT 1
       FOR UPDATE`,
      [id, userId]
    );

    if (otpRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'No OTP found. Please request a new OTP.' });
    }

    const otpRow = otpRows[0];

    if (otpRow.pending_status !== nextStatus) {
      await connection.rollback();
      return res.status(400).json({ message: 'OTP was issued for a different status. Request a new OTP.' });
    }

    if (otpRow.consumed_at) {
      await connection.rollback();
      return res.status(400).json({ message: 'OTP already used. Please request a new OTP.' });
    }

    if (new Date(otpRow.expires_at).getTime() < Date.now()) {
      await connection.rollback();
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    if (otpRow.attempts >= STATUS_OTP_MAX_ATTEMPTS) {
      await connection.rollback();
      return res.status(429).json({ message: 'Too many invalid attempts. Please request a new OTP.' });
    }

    const incomingHash = hashOtp(otp);
    if (incomingHash !== otpRow.otp_hash) {
      await connection.execute(
        'UPDATE listing_completion_otps SET attempts = attempts + 1 WHERE otp_id = ?',
        [otpRow.otp_id]
      );
      await connection.commit();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await connection.execute(
      'UPDATE products SET status = ? WHERE product_id = ?',
      [nextStatus, id]
    );

    const creditsToAdd = nextStatus === 'DONATED' ? 50 : 20;
    await connection.execute(
      'UPDATE users SET green_credits = green_credits + ? WHERE user_id = ?',
      [creditsToAdd, product.seller_id]
    );

    await connection.execute(
      'UPDATE listing_completion_otps SET consumed_at = UTC_TIMESTAMP() WHERE otp_id = ?',
      [otpRow.otp_id]
    );

    await connection.commit();

    return res.status(200).json({
      message: `Product marked as ${nextStatus}. You earned ${creditsToAdd} green credits!`,
      status: nextStatus,
      creditsEarned: creditsToAdd,
    });
  } catch (err) {
    await connection.rollback();
    console.error('Confirm product status OTP error:', err);
    return res.status(500).json({ message: 'Server error confirming product status' });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/products/:id/status
// ─────────────────────────────────────────────────────────────
// Update product status (e.g., mark as SOLD or DONATED).
// When status changes to SOLD or DONATED, increment seller's green_credits.
// Only the owner of the product can update its status.

export const updateProductStatus = async (req, res) => {
  return res.status(400).json({
    message: 'Direct status update is disabled. Request OTP first via /api/products/:id/status/request-otp and then confirm via /api/products/:id/status/confirm-otp.',
    code: 'STATUS_OTP_REQUIRED',
  });
};
