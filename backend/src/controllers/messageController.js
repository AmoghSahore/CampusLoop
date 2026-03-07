import pool from '../config/db.js';

// ─────────────────────────────────────────────────────────────
// POST /api/messages
// ─────────────────────────────────────────────────────────────
// Send a message from one user to another regarding a product.
// Stores in chat_messages table with sender, receiver, product, and message text.

export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, product_id, message } = req.body;
    const sender_id = req.user.userId;

    // Validation
    if (!receiver_id || !product_id || !message) {
      return res.status(400).json({
        message: 'receiver_id, product_id, and message are required',
      });
    }

    if (!message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    // Verify product exists
    const [productRows] = await pool.execute(
      'SELECT product_id FROM products WHERE product_id = ?',
      [product_id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify receiver exists
    const [receiverRows] = await pool.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [receiver_id]
    );

    if (receiverRows.length === 0) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Insert message into chat_messages table
    const [result] = await pool.execute(
      `INSERT INTO chat_messages (sender_id, receiver_id, product_id, message)
       VALUES (?, ?, ?, ?)`,
      [sender_id, receiver_id, product_id, message.trim()]
    );

    // Fetch the created message with sender info
    const [messageRows] = await pool.execute(
      `SELECT 
         cm.chat_id,
         cm.sender_id,
         cm.receiver_id,
         cm.product_id,
         cm.message,
         cm.created_at,
         u.name as sender_name
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.user_id
       WHERE cm.chat_id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      message: 'Message sent successfully',
      data: {
        chat_id: messageRows[0].chat_id,
        sender_id: messageRows[0].sender_id,
        receiver_id: messageRows[0].receiver_id,
        product_id: messageRows[0].product_id,
        message: messageRows[0].message,
        created_at: messageRows[0].created_at,
        sender: {
          name: messageRows[0].sender_name,
        },
      },
    });
  } catch (err) {
    console.error('Send message error:', err);
    return res.status(500).json({ message: 'Server error sending message' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/messages/:product_id/:user_id
// ─────────────────────────────────────────────────────────────
// Retrieve conversation between current user and specified user_id
// regarding a specific product. Messages ordered by created_at ASC.

export const getMessages = async (req, res) => {
  try {
    const { product_id, user_id } = req.params;
    const currentUserId = req.user.userId;

    // Validation
    if (!product_id || !user_id) {
      return res.status(400).json({
        message: 'product_id and user_id are required',
      });
    }

    // Fetch conversation messages between current user and specified user
    // for this product, ordered chronologically
    const [messages] = await pool.execute(
      `SELECT 
         cm.chat_id,
         cm.sender_id,
         cm.receiver_id,
         cm.product_id,
         cm.message,
         cm.created_at,
         sender.name as sender_name,
         receiver.name as receiver_name
       FROM chat_messages cm
       JOIN users sender ON cm.sender_id = sender.user_id
       JOIN users receiver ON cm.receiver_id = receiver.user_id
       WHERE cm.product_id = ?
         AND (
           (cm.sender_id = ? AND cm.receiver_id = ?)
           OR (cm.sender_id = ? AND cm.receiver_id = ?)
         )
       ORDER BY cm.created_at ASC`,
      [product_id, currentUserId, user_id, user_id, currentUserId]
    );

    return res.status(200).json({
      product_id: parseInt(product_id),
      conversation_with: parseInt(user_id),
      messages: messages.map((msg) => ({
        chat_id: msg.chat_id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        message: msg.message,
        created_at: msg.created_at,
        sender: {
          name: msg.sender_name,
        },
        receiver: {
          name: msg.receiver_name,
        },
      })),
    });
  } catch (err) {
    console.error('Get messages error:', err);
    return res.status(500).json({ message: 'Server error fetching messages' });
  }
};
