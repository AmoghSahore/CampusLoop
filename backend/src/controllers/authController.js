import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { sendOtpEmail } from '../services/emailService.js';
import {
    generateOtp,
    hashOtp,
    OTP_EXPIRE_MINUTES,
    OTP_MAX_ATTEMPTS,
    OTP_RESEND_COOLDOWN_SECONDS,
    OTP_MAX_RESENDS,
} from '../services/otpService.js';

// ─────────────────────────────────────────────────────────────
// HELPER: generate a signed JWT for a given user row
// ─────────────────────────────────────────────────────────────
// We store only the minimum needed in the token payload:
//   userId  — so every auth-protected route knows WHO is making the request
//   email   — handy for logging / display without a DB lookup
//
// jwt.sign(payload, secret, options)
//   • secret comes from .env so it is never committed to Git
//   • expiresIn means the token becomes invalid after 7 days;
//     the user will need to log in again (good security practice)
const generateToken = (user) => {
    return jwt.sign(
        { userId: user.user_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// ─────────────────────────────────────────────────────────────
// HELPER: shape the user object we send back to the frontend
// ─────────────────────────────────────────────────────────────
// The frontend stores this in localStorage and reads it with getUser().
// We NEVER send password_hash to the client — strip it here.
// We alias user_id → _id so the frontend (which was written with
// MongoDB-style _id) works without any changes.
const formatUser = (user) => ({
    _id: user.user_id,
    name: user.name,
    email: user.email,
    isEmailVerified: !!user.is_email_verified,
    status: user.status,
    greenCredits: user.green_credits,
    createdAt: user.created_at,
});

const saveOtpForUser = async (userId, otp) => {
    const otpHash = hashOtp(otp);
    await pool.execute(
        `INSERT INTO email_verification_otps
            (user_id, otp_hash, expires_at, attempts, resend_count, last_sent_at, consumed_at)
         VALUES
            (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE), 0, 1, UTC_TIMESTAMP(), NULL)
         ON DUPLICATE KEY UPDATE
            otp_hash = VALUES(otp_hash),
            expires_at = VALUES(expires_at),
            attempts = 0,
            consumed_at = NULL,
            resend_count = resend_count + 1,
            last_sent_at = UTC_TIMESTAMP()`,
        [userId, otpHash, OTP_EXPIRE_MINUTES]
    );
};

const generateAndSendOtp = async (user) => {
    const otp = generateOtp();
    await saveOtpForUser(user.user_id, otp);
    await sendOtpEmail({
        to: user.email,
        name: user.name,
        otp,
        expiresMinutes: OTP_EXPIRE_MINUTES,
    });
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────────────────────────
// What happens step by step:
//   1. Validate that all required fields are present
//   2. Make sure the two passwords match (client does this too, but
//      never trust only the client — always validate on the server)
//   3. Check the DB: does this email already exist?
//      A unique constraint in MySQL would also catch this, but returning
//      a clear "email already in use" message is better UX than a DB error
//   4. Hash the password — bcrypt's saltRounds=12 means it runs 2^12
//      iterations, making brute-force attacks very slow
//   5. Insert the new user row
//   6. Generate a JWT and return it with the user object
export const signup = async (req, res) => {
    try {
        // --- 1. Destructure & validate ---
        // The frontend sends: fullName, email, password, confirmPassword,
        // university, agreeToTerms
        // Our schema has: name (not fullName), no university column —
        // so we map fullName → name and silently ignore university
        // (schema is frozen and university can be added later if needed)
        const { fullName, email, password, confirmPassword } = req.body;
        const normalizedEmail = (email || '').toLowerCase().trim();

        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        // Christ University-only restriction:
        // allows both formats like:
        //   user@christuniversity.in
        //   user@mca.christuniversity.in
        if (!normalizedEmail.endsWith('christuniversity.in')) {
            return res.status(400).json({
                message: 'Only Christ University email addresses are allowed (must end with christuniversity.in)',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // --- 2. Password confirmation ---
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // --- 3. Check for duplicate email ---
        // pool.execute() is like pool.query() but uses prepared statements,
        // which automatically prevent SQL injection — always use this
        const [existing] = await pool.execute(
            'SELECT user_id FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        // --- 4. Hash the password ---
        // NEVER store plain-text passwords. bcrypt.hash() does two things:
        //   a) generates a random salt (so two users with the same password
        //      get different hashes)
        //   b) runs the hashing function 2^12 = 4096 times (saltRounds=12)
        // This makes it very hard for attackers to reverse the hash
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // --- 5. Insert user ---
        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password_hash)
       VALUES (?, ?, ?)`,
            [fullName.trim(), normalizedEmail, password_hash]
        );

        // result.insertId gives us the auto-incremented user_id MySQL assigned
        const newUserId = result.insertId;

        // Fetch the full row so we can return accurate timestamps etc.
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE user_id = ?',
            [newUserId]
        );
        const newUser = rows[0];

        try {
            await generateAndSendOtp(newUser);
        } catch (otpErr) {
            console.error('OTP send error after signup:', otpErr);
        }

        return res.status(201).json({
            message: 'Account created. Please verify your email with the OTP sent to your inbox.',
            requiresVerification: true,
            email: newUser.email,
            user: formatUser(newUser),
        });

    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ message: 'Server error during signup' });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
// Step by step:
//   1. Validate that email and password are provided
//   2. Look up the user by email — if not found, return a vague error
//      (we don't want to tell attackers "that email doesn't exist")
//   3. Check if the account is active (not banned/suspended)
//   4. Use bcrypt.compare() to safely check the password against the hash
//   5. Return JWT + user object on success
export const login = async (req, res) => {
    try {
        // --- 1. Validate ---
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // --- 2. Find user by email ---
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email.toLowerCase().trim()]
        );

        // Use a deliberately vague message — never reveal whether the email
        // exists or not, as that would help attackers enumerate valid accounts
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        // --- 3. Check account status ---
        if (user.status === 'BANNED') {
            return res.status(403).json({ message: 'Your account has been banned. Contact support to appeal.' });
        }
        if (user.status === 'SUSPENDED') {
            return res.status(403).json({ message: 'Your account is temporarily suspended.' });
        }

        if (!user.is_email_verified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in.',
                code: 'EMAIL_NOT_VERIFIED',
                email: user.email,
            });
        }

        // --- 4. Verify password ---
        // bcrypt.compare() re-hashes the plain-text password with the stored
        // salt and checks if it matches the stored hash — timing-safe
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // --- 5. Return token + user ---
        const token = generateToken(user);

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: formatUser(user),
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Server error during login' });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// ─────────────────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = (email || '').toLowerCase().trim();

        if (!normalizedEmail || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const [users] = await pool.execute(
            'SELECT user_id, email, is_email_verified FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const user = users[0];

        if (user.is_email_verified) {
            return res.status(200).json({ message: 'Email already verified' });
        }

        const [otpRows] = await pool.execute(
            `SELECT otp_id, otp_hash, attempts, expires_at, consumed_at
             FROM email_verification_otps
             WHERE user_id = ?
             LIMIT 1`,
            [user.user_id]
        );

        if (otpRows.length === 0) {
            return res.status(400).json({ message: 'No OTP found. Please request a new OTP.' });
        }

        const otpRow = otpRows[0];

        if (otpRow.consumed_at) {
            return res.status(400).json({ message: 'OTP already used. Please request a new OTP.' });
        }

        if (new Date(otpRow.expires_at).getTime() < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
        }

        if (otpRow.attempts >= OTP_MAX_ATTEMPTS) {
            return res.status(429).json({ message: 'Too many invalid attempts. Please request a new OTP.' });
        }

        const incomingHash = hashOtp(otp);
        if (incomingHash !== otpRow.otp_hash) {
            await pool.execute(
                'UPDATE email_verification_otps SET attempts = attempts + 1 WHERE otp_id = ?',
                [otpRow.otp_id]
            );
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        await pool.execute(
            'UPDATE users SET is_email_verified = 1, email_verified_at = UTC_TIMESTAMP() WHERE user_id = ?',
            [user.user_id]
        );
        await pool.execute(
            'UPDATE email_verification_otps SET consumed_at = UTC_TIMESTAMP() WHERE otp_id = ?',
            [otpRow.otp_id]
        );

        return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        console.error('Verify OTP error:', err);
        return res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/resend-otp
// ─────────────────────────────────────────────────────────────
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = (email || '').toLowerCase().trim();

        if (!normalizedEmail) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const [users] = await pool.execute(
            'SELECT user_id, name, email, is_email_verified FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const user = users[0];

        if (user.is_email_verified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        const [otpRows] = await pool.execute(
            `SELECT resend_count, last_sent_at
             FROM email_verification_otps
             WHERE user_id = ?
             LIMIT 1`,
            [user.user_id]
        );

        if (otpRows.length > 0) {
            const otpRow = otpRows[0];
            const lastSent = otpRow.last_sent_at ? new Date(otpRow.last_sent_at).getTime() : 0;
            const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS * 1000;
            const timeLeft = Math.ceil((lastSent + cooldownMs - Date.now()) / 1000);

            if (timeLeft > 0) {
                return res.status(429).json({
                    message: `Please wait ${timeLeft}s before requesting another OTP.`,
                    retryAfterSeconds: timeLeft,
                });
            }

            if (otpRow.resend_count >= OTP_MAX_RESENDS) {
                return res.status(429).json({ message: 'OTP resend limit reached. Please contact support.' });
            }
        }

        try {
            await generateAndSendOtp(user);
        } catch (otpErr) {
            console.error('Resend OTP send error:', otpErr);
            return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
        }

        return res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Resend OTP error:', err);
        return res.status(500).json({ message: 'Server error while resending OTP' });
    }
};
