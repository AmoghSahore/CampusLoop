import pool from '../config/db.js';

export const getChatConversations = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const [rows] = await pool.execute(
      `SELECT
         cm.product_id,
         CASE
           WHEN cm.sender_id = ? THEN cm.receiver_id
           ELSE cm.sender_id
         END AS other_user_id,
         u.name AS other_user_name,
         COALESCE(p.title, 'Item') AS product_title,
         cm.message AS last_message,
         cm.created_at AS last_message_at,
         cm.chat_id AS last_chat_id
       FROM chat_messages cm
       JOIN (
         SELECT
           LEAST(sender_id, receiver_id) AS user_a,
           GREATEST(sender_id, receiver_id) AS user_b,
           product_id,
           MAX(chat_id) AS last_chat_id
         FROM chat_messages
         WHERE sender_id = ? OR receiver_id = ?
         GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), product_id
       ) latest
         ON cm.chat_id = latest.last_chat_id
       JOIN users u
         ON u.user_id = CASE
           WHEN cm.sender_id = ? THEN cm.receiver_id
           ELSE cm.sender_id
         END
       LEFT JOIN products p ON p.product_id = cm.product_id
       WHERE cm.sender_id = ? OR cm.receiver_id = ?
       ORDER BY cm.created_at DESC`,
      [
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
      ]
    );

    return res.status(200).json({
      conversations: rows.map((row) => ({
        productId: row.product_id,
        otherUserId: row.other_user_id,
        otherUserName: row.other_user_name,
        productTitle: row.product_title,
        lastMessage: row.last_message,
        lastMessageAt: row.last_message_at,
        lastChatId: row.last_chat_id,
      })),
    });
  } catch (err) {
    console.error('Get chat conversations error:', err);
    return res.status(500).json({ message: 'Server error fetching chat conversations' });
  }
};
