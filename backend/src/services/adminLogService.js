import pool from '../config/db.js';

export const logAdminAction = async ({ adminId, targetType, targetId, action, reason }) => {
  await pool.execute(
    `INSERT INTO admin_action_logs (admin_id, target_type, target_id, action, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [adminId, targetType, targetId, action, reason || '']
  );
};
