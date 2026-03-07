import pool from '../config/db.js';

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE: Check if user status is ACTIVE
// ─────────────────────────────────────────────────────────────
// This middleware verifies that the authenticated user has an
// ACTIVE status. Users who are SUSPENDED or BANNED cannot
// perform write operations (upload, post listings, send messages).
//
// Must be used AFTER authMiddleware, as it relies on req.user.userId

const checkActiveStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Query user status from database
    const [rows] = await pool.execute(
      'SELECT status FROM users WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userStatus = rows[0].status;

    // Only allow ACTIVE users to proceed
    if (userStatus !== 'ACTIVE') {
      return res.status(403).json({
        message: `Your account is ${userStatus.toLowerCase()}. Contact support for assistance.`,
      });
    }

    // User is active, proceed to next middleware/controller
    next();
  } catch (err) {
    console.error('Check active status error:', err);
    return res.status(500).json({ message: 'Server error checking user status' });
  }
};

export default checkActiveStatus;
