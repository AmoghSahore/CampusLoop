import pool from '../config/db.js';

const mapWishlistProduct = (row) => ({
  _id: row.product_id,
  title: row.title,
  category: row.category,
  price: row.price,
  listingType: row.listing_type,
  status: row.status,
  createdAt: row.created_at,
  imageUrl: row.image_url || null,
  seller: {
    name: row.seller_name,
  },
});

// GET /api/wishlist
export const getWishlistItems = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await pool.execute(
      `SELECT
         p.product_id,
         p.title,
         p.category,
         p.price,
         p.listing_type,
         p.status,
         p.created_at,
         u.name AS seller_name,
         (SELECT image_url FROM product_images
          WHERE product_id = p.product_id
          ORDER BY image_id ASC LIMIT 1) AS image_url
       FROM wishlists w
       JOIN products p ON p.product_id = w.product_id
       JOIN users u ON u.user_id = p.seller_id
       WHERE w.user_id = ?
         AND p.moderation_status = 'ACTIVE'
       ORDER BY w.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      items: rows.map(mapWishlistProduct),
      ids: rows.map((row) => String(row.product_id)),
    });
  } catch (err) {
    console.error('Get wishlist error:', err);
    return res.status(500).json({ message: 'Server error fetching wishlist' });
  }
};

// POST /api/wishlist/:productId
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const [productRows] = await pool.execute(
      `SELECT product_id
       FROM products
       WHERE product_id = ?
         AND moderation_status = 'ACTIVE'`,
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await pool.execute(
      `INSERT INTO wishlists (user_id, product_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE created_at = created_at`,
      [userId, productId]
    );

    return res.status(200).json({ message: 'Added to wishlist', productId: String(productId) });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    return res.status(500).json({ message: 'Server error adding to wishlist' });
  }
};

// DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    await pool.execute(
      'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    return res.status(200).json({ message: 'Removed from wishlist', productId: String(productId) });
  } catch (err) {
    console.error('Remove wishlist error:', err);
    return res.status(500).json({ message: 'Server error removing from wishlist' });
  }
};
