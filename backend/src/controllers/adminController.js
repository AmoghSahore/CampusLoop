import pool from '../config/db.js';
import { logAdminAction } from '../services/adminLogService.js';

const REPORT_STATUSES = ['OPEN', 'REVIEWED', 'DISMISSED', 'ACTIONED'];
const APPEAL_STATUSES = ['OPEN', 'ACCEPTED', 'REJECTED'];
const USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'BANNED'];
const PRODUCT_MODERATION_STATUSES = ['ACTIVE', 'UNDER_REVIEW', 'REMOVED'];

const requireReasonForStatuses = (status, reason, statuses) => {
  if (!statuses.includes(status)) {
    return null;
  }
  if (!reason || !String(reason).trim()) {
    return 'Reason is required for this moderation action';
  }
  return null;
};

export const getAdminSummary = async (_req, res) => {
  try {
    const [reportCounts] = await pool.execute(
      `SELECT status, COUNT(*) AS count
       FROM product_reports
       GROUP BY status`
    );

    const [appealCounts] = await pool.execute(
      `SELECT status, COUNT(*) AS count
       FROM appeals
       GROUP BY status`
    );

    const [userCounts] = await pool.execute(
      `SELECT status, COUNT(*) AS count
       FROM users
       GROUP BY status`
    );

    const [productCounts] = await pool.execute(
      `SELECT moderation_status, COUNT(*) AS count
       FROM products
       GROUP BY moderation_status`
    );

    const [todayActions] = await pool.execute(
      `SELECT COUNT(*) AS count
       FROM admin_action_logs
       WHERE DATE(created_at) = UTC_DATE()`
    );

    const toMap = (rows, keyField) => rows.reduce((acc, row) => {
      acc[row[keyField]] = Number(row.count);
      return acc;
    }, {});

    const reports = toMap(reportCounts, 'status');
    const appeals = toMap(appealCounts, 'status');
    const users = toMap(userCounts, 'status');
    const products = toMap(productCounts, 'moderation_status');

    return res.status(200).json({
      reports: {
        total: Object.values(reports).reduce((sum, count) => sum + count, 0),
        open: reports.OPEN || 0,
        reviewed: reports.REVIEWED || 0,
        dismissed: reports.DISMISSED || 0,
        actioned: reports.ACTIONED || 0,
      },
      appeals: {
        total: Object.values(appeals).reduce((sum, count) => sum + count, 0),
        open: appeals.OPEN || 0,
        accepted: appeals.ACCEPTED || 0,
        rejected: appeals.REJECTED || 0,
      },
      users: {
        total: Object.values(users).reduce((sum, count) => sum + count, 0),
        active: users.ACTIVE || 0,
        suspended: users.SUSPENDED || 0,
        banned: users.BANNED || 0,
      },
      products: {
        total: Object.values(products).reduce((sum, count) => sum + count, 0),
        active: products.ACTIVE || 0,
        underReview: products.UNDER_REVIEW || 0,
        removed: products.REMOVED || 0,
      },
      actionsToday: Number(todayActions[0]?.count || 0),
    });
  } catch (err) {
    console.error('Get admin summary error:', err);
    return res.status(500).json({ message: 'Server error fetching admin summary' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { status, q } = req.query;
    const where = [];
    const params = [];

    if (status) {
      where.push('u.status = ?');
      params.push(String(status).toUpperCase());
    }

    if (q) {
      where.push('(u.name LIKE ? OR u.email LIKE ? OR CAST(u.user_id AS CHAR) LIKE ?)');
      const wildcard = `%${String(q).trim()}%`;
      params.push(wildcard, wildcard, wildcard);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.execute(
      `SELECT
         u.user_id,
         u.name,
         u.email,
         u.status,
         u.green_credits,
         u.is_email_verified,
         u.created_at,
         u.updated_at
       FROM users u
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT 300`,
      params
    );

    return res.status(200).json(rows.map((row) => ({
      _id: row.user_id,
      name: row.name,
      email: row.email,
      status: row.status,
      greenCredits: row.green_credits,
      isEmailVerified: !!row.is_email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })));
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ message: 'Server error fetching users' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { moderationStatus, q } = req.query;
    const where = [];
    const params = [];

    if (moderationStatus) {
      where.push('p.moderation_status = ?');
      params.push(String(moderationStatus).toUpperCase());
    }

    if (q) {
      where.push('(p.title LIKE ? OR p.category LIKE ? OR CAST(p.product_id AS CHAR) LIKE ? OR CAST(p.seller_id AS CHAR) LIKE ?)');
      const wildcard = `%${String(q).trim()}%`;
      params.push(wildcard, wildcard, wildcard, wildcard);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.execute(
      `SELECT
         p.product_id,
         p.seller_id,
         p.title,
         p.category,
         p.listing_type,
         p.status,
         p.moderation_status,
         p.price,
         p.created_at,
         p.updated_at,
         u.name AS seller_name,
         u.email AS seller_email
       FROM products p
       JOIN users u ON u.user_id = p.seller_id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT 300`,
      params
    );

    return res.status(200).json(rows.map((row) => ({
      _id: row.product_id,
      sellerId: row.seller_id,
      title: row.title,
      category: row.category,
      listingType: row.listing_type,
      status: row.status,
      moderationStatus: row.moderation_status,
      price: row.price,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      seller: {
        _id: row.seller_id,
        name: row.seller_name,
        email: row.seller_email,
      },
    })));
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({ message: 'Server error fetching products' });
  }
};

export const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const where = [];
    const params = [];

    if (status) {
      where.push('pr.status = ?');
      params.push(String(status).toUpperCase());
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.execute(
      `SELECT
         pr.report_id,
         pr.product_id,
         pr.reported_by,
         pr.reason,
         pr.status,
         pr.admin_id,
         pr.created_at,
         pr.reviewed_at,
         p.title AS product_title,
         ru.name AS reporter_name,
         a.email AS admin_email
       FROM product_reports pr
       JOIN products p ON p.product_id = pr.product_id
       JOIN users ru ON ru.user_id = pr.reported_by
       LEFT JOIN admins a ON a.admin_id = pr.admin_id
       ${whereClause}
       ORDER BY pr.created_at DESC`,
      params
    );

    return res.status(200).json(rows.map((row) => ({
      _id: row.report_id,
      productId: row.product_id,
      productTitle: row.product_title,
      reportedBy: { _id: row.reported_by, name: row.reporter_name },
      reason: row.reason,
      status: row.status,
      reviewedBy: row.admin_id ? { _id: row.admin_id, email: row.admin_email } : null,
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at,
    })));
  } catch (err) {
    console.error('Get reports error:', err);
    return res.status(500).json({ message: 'Server error fetching reports' });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const { id } = req.params;
    const { status, reason } = req.body;
    const normalizedStatus = String(status || '').toUpperCase();

    if (!REPORT_STATUSES.includes(normalizedStatus) || normalizedStatus === 'OPEN') {
      return res.status(400).json({ message: 'Invalid report status' });
    }

    const reasonError = requireReasonForStatuses(normalizedStatus, reason, ['DISMISSED', 'ACTIONED']);
    if (reasonError) {
      return res.status(400).json({ message: reasonError });
    }

    const [rows] = await pool.execute(
      'SELECT report_id, product_id, status FROM product_reports WHERE report_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const report = rows[0];
    if (report.status === normalizedStatus) {
      return res.status(400).json({ message: 'Report already has this status' });
    }

    await pool.execute(
      `UPDATE product_reports
       SET status = ?, admin_id = ?, reviewed_at = UTC_TIMESTAMP()
       WHERE report_id = ?`,
      [normalizedStatus, adminId, id]
    );

    await logAdminAction({
      adminId,
      targetType: 'PRODUCT',
      targetId: report.product_id,
      action: `REPORT_${normalizedStatus}`,
      reason: reason || `Report ${id} marked as ${normalizedStatus}`,
    });

    return res.status(200).json({ message: `Report marked as ${normalizedStatus}` });
  } catch (err) {
    console.error('Update report status error:', err);
    return res.status(500).json({ message: 'Server error updating report status' });
  }
};

export const getAppeals = async (req, res) => {
  try {
    const { status } = req.query;
    const where = [];
    const params = [];

    if (status) {
      where.push('ap.status = ?');
      params.push(String(status).toUpperCase());
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.execute(
      `SELECT
         ap.appeal_id,
         ap.user_id,
         ap.reason,
         ap.status,
         ap.admin_id,
         ap.created_at,
         ap.reviewed_at,
         u.name AS user_name,
         u.email AS user_email,
         a.email AS admin_email
       FROM appeals ap
       JOIN users u ON u.user_id = ap.user_id
       LEFT JOIN admins a ON a.admin_id = ap.admin_id
       ${whereClause}
       ORDER BY ap.created_at DESC`,
      params
    );

    return res.status(200).json(rows.map((row) => ({
      _id: row.appeal_id,
      user: { _id: row.user_id, name: row.user_name, email: row.user_email },
      reason: row.reason,
      status: row.status,
      reviewedBy: row.admin_id ? { _id: row.admin_id, email: row.admin_email } : null,
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at,
    })));
  } catch (err) {
    console.error('Get appeals error:', err);
    return res.status(500).json({ message: 'Server error fetching appeals' });
  }
};

export const updateAppealStatus = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const { id } = req.params;
    const { status, reason } = req.body;
    const normalizedStatus = String(status || '').toUpperCase();

    if (!APPEAL_STATUSES.includes(normalizedStatus) || normalizedStatus === 'OPEN') {
      return res.status(400).json({ message: 'Invalid appeal status' });
    }

    const reasonError = requireReasonForStatuses(normalizedStatus, reason, ['REJECTED']);
    if (reasonError) {
      return res.status(400).json({ message: reasonError });
    }

    const [rows] = await pool.execute(
      'SELECT appeal_id, user_id, status FROM appeals WHERE appeal_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Appeal not found' });
    }

    const appeal = rows[0];
    if (appeal.status === normalizedStatus) {
      return res.status(400).json({ message: 'Appeal already has this status' });
    }

    await pool.execute(
      `UPDATE appeals
       SET status = ?, admin_id = ?, reviewed_at = UTC_TIMESTAMP()
       WHERE appeal_id = ?`,
      [normalizedStatus, adminId, id]
    );

    if (normalizedStatus === 'ACCEPTED') {
      await pool.execute(
        'UPDATE users SET status = ? WHERE user_id = ?',
        ['ACTIVE', appeal.user_id]
      );
    }

    await logAdminAction({
      adminId,
      targetType: 'USER',
      targetId: appeal.user_id,
      action: `APPEAL_${normalizedStatus}`,
      reason: reason || `Appeal ${id} marked as ${normalizedStatus}`,
    });

    return res.status(200).json({ message: `Appeal marked as ${normalizedStatus}` });
  } catch (err) {
    console.error('Update appeal status error:', err);
    return res.status(500).json({ message: 'Server error updating appeal status' });
  }
};

export const updateUserStatusByAdmin = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const { id } = req.params;
    const { status, reason } = req.body;
    const normalizedStatus = String(status || '').toUpperCase();

    if (!USER_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Invalid user status' });
    }

    const reasonError = requireReasonForStatuses(normalizedStatus, reason, ['SUSPENDED', 'BANNED']);
    if (reasonError) {
      return res.status(400).json({ message: reasonError });
    }

    const [rows] = await pool.execute(
      'SELECT user_id, status FROM users WHERE user_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    if (user.status === normalizedStatus) {
      return res.status(400).json({ message: 'User already has this status' });
    }

    await pool.execute(
      'UPDATE users SET status = ? WHERE user_id = ?',
      [normalizedStatus, id]
    );

    await logAdminAction({
      adminId,
      targetType: 'USER',
      targetId: Number(id),
      action: `USER_${normalizedStatus}`,
      reason: reason || `User status updated to ${normalizedStatus}`,
    });

    return res.status(200).json({ message: `User status updated to ${normalizedStatus}` });
  } catch (err) {
    console.error('Update user status error:', err);
    return res.status(500).json({ message: 'Server error updating user status' });
  }
};

export const updateProductModerationStatus = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const { id } = req.params;
    const { moderationStatus, reason } = req.body;
    const normalizedStatus = String(moderationStatus || '').toUpperCase();

    if (!PRODUCT_MODERATION_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Invalid moderation status' });
    }

    const reasonError = requireReasonForStatuses(normalizedStatus, reason, ['REMOVED']);
    if (reasonError) {
      return res.status(400).json({ message: reasonError });
    }

    const [rows] = await pool.execute(
      'SELECT product_id, moderation_status FROM products WHERE product_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = rows[0];
    if (product.moderation_status === normalizedStatus) {
      return res.status(400).json({ message: 'Product already has this moderation status' });
    }

    await pool.execute(
      'UPDATE products SET moderation_status = ? WHERE product_id = ?',
      [normalizedStatus, id]
    );

    await logAdminAction({
      adminId,
      targetType: 'PRODUCT',
      targetId: Number(id),
      action: `PRODUCT_${normalizedStatus}`,
      reason: reason || `Product moderation updated to ${normalizedStatus}`,
    });

    return res.status(200).json({ message: `Product moderation status updated to ${normalizedStatus}` });
  } catch (err) {
    console.error('Update product moderation error:', err);
    return res.status(500).json({ message: 'Server error updating product moderation status' });
  }
};

export const getAdminLogs = async (req, res) => {
  try {
    const rawLimit = Number(req.query.limit) || 50;
    const limit = Math.min(Math.max(rawLimit, 1), 100);

    const [rows] = await pool.execute(
      `SELECT
         l.log_id,
         l.admin_id,
         l.target_type,
         l.target_id,
         l.action,
         l.reason,
         l.created_at,
         a.email AS admin_email
       FROM admin_action_logs l
       JOIN admins a ON a.admin_id = l.admin_id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [limit]
    );

    return res.status(200).json(rows.map((row) => ({
      _id: row.log_id,
      admin: { _id: row.admin_id, email: row.admin_email },
      targetType: row.target_type,
      targetId: row.target_id,
      action: row.action,
      reason: row.reason,
      createdAt: row.created_at,
    })));
  } catch (err) {
    console.error('Get admin logs error:', err);
    return res.status(500).json({ message: 'Server error fetching admin logs' });
  }
};
