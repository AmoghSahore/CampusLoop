import pool from '../config/db.js';

// ─────────────────────────────────────────────────────────────
// PATCH /api/products/:id/status
// ─────────────────────────────────────────────────────────────
// Update product status (e.g., mark as SOLD or DONATED).
// When status changes to SOLD or DONATED, increment seller's green_credits.
// Only the owner of the product can update its status.

export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Validate status
    const validStatuses = ['AVAILABLE', 'SOLD', 'DONATED'];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: AVAILABLE, SOLD, DONATED',
      });
    }

    const newStatus = status.toUpperCase();

    // Get current product details
    const [productRows] = await pool.execute(
      'SELECT seller_id, status FROM products WHERE product_id = ?',
      [id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productRows[0];

    // Check ownership
    if (product.seller_id !== userId) {
      return res.status(403).json({
        message: 'You can only update status for your own products',
      });
    }

    // Prevent duplicate status updates
    if (product.status === newStatus) {
      return res.status(400).json({
        message: `Product is already marked as ${newStatus}`,
      });
    }

    // Update product status
    await pool.execute(
      'UPDATE products SET status = ? WHERE product_id = ?',
      [newStatus, id]
    );

    // If transitioning to SOLD or DONATED, increment seller's green_credits
    // Only increment if previous status was AVAILABLE (prevent double-counting)
    if ((newStatus === 'SOLD' || newStatus === 'DONATED') && product.status === 'AVAILABLE') {
      const creditsToAdd = newStatus === 'DONATED' ? 50 : 20; // Donate gives more credits
      
      await pool.execute(
        'UPDATE users SET green_credits = green_credits + ? WHERE user_id = ?',
        [creditsToAdd, product.seller_id]
      );

      return res.status(200).json({
        message: `Product marked as ${newStatus}. You earned ${creditsToAdd} green credits!`,
        status: newStatus,
        creditsEarned: creditsToAdd,
      });
    }

    return res.status(200).json({
      message: `Product status updated to ${newStatus}`,
      status: newStatus,
    });
  } catch (err) {
    console.error('Update product status error:', err);
    return res.status(500).json({ message: 'Server error updating product status' });
  }
};
