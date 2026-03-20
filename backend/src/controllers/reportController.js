import pool from '../config/db.js';

export const submitReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product_id, reason } = req.body;

    if (!product_id || !reason || !reason.trim()) {
      return res.status(400).json({ message: 'product_id and reason are required' });
    }

    const [productRows] = await pool.execute(
      `SELECT product_id
       FROM products
       WHERE product_id = ?
         AND moderation_status != 'REMOVED'`,
      [product_id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [existing] = await pool.execute(
      `SELECT report_id
       FROM product_reports
       WHERE product_id = ?
         AND reported_by = ?
         AND status = 'OPEN'
       LIMIT 1`,
      [product_id, userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'You already have an open report for this product' });
    }

    const [result] = await pool.execute(
      `INSERT INTO product_reports (product_id, reported_by, reason)
       VALUES (?, ?, ?)`,
      [product_id, userId, reason.trim()]
    );

    return res.status(201).json({
      message: 'Report submitted successfully',
      reportId: result.insertId,
    });
  } catch (err) {
    console.error('Submit report error:', err);
    return res.status(500).json({ message: 'Server error submitting report' });
  }
};
