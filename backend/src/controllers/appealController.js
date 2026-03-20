import pool from '../config/db.js';

export const submitAppeal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const [userRows] = await pool.execute(
      'SELECT status FROM users WHERE user_id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userRows[0].status === 'ACTIVE') {
      return res.status(400).json({ message: 'Only suspended or banned users can submit an appeal' });
    }

    const [existing] = await pool.execute(
      `SELECT appeal_id
       FROM appeals
       WHERE user_id = ?
         AND status = 'OPEN'
       LIMIT 1`,
      [userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'You already have an open appeal' });
    }

    const [result] = await pool.execute(
      'INSERT INTO appeals (user_id, reason) VALUES (?, ?)',
      [userId, reason.trim()]
    );

    return res.status(201).json({ message: 'Appeal submitted successfully', appealId: result.insertId });
  } catch (err) {
    console.error('Submit appeal error:', err);
    return res.status(500).json({ message: 'Server error submitting appeal' });
  }
};

export const getMyAppeals = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [rows] = await pool.execute(
      `SELECT appeal_id, reason, status, created_at, reviewed_at
       FROM appeals
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json(rows.map((row) => ({
      _id: row.appeal_id,
      reason: row.reason,
      status: row.status,
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at,
    })));
  } catch (err) {
    console.error('Get appeals error:', err);
    return res.status(500).json({ message: 'Server error fetching appeals' });
  }
};
