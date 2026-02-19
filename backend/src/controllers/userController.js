import pool from '../config/db.js';

// ─────────────────────────────────────────────────────────────
// GET /api/users/profile
// ─────────────────────────────────────────────────────────────
// Returns the logged-in user's profile data.
//
// req.user is set by the auth middleware and contains { userId, email }
// decoded from the JWT — so we never trust the client to say who they are.
// We always look up the user_id FROM the token, not from the request body.
//
// We also compute two stats in the same query using subqueries:
//   totalListings        — how many active/available listings they have
//   completedTransactions — how many they've sold or donated
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [rows] = await pool.execute(
            `SELECT
         user_id,
         name,
         email,
         status,
         green_credits,
         created_at,
         -- Count only non-removed listings as "active"
         (SELECT COUNT(*) FROM products
          WHERE seller_id = u.user_id
            AND moderation_status != 'REMOVED') AS total_listings,
         -- Count listings that have been sold or donated
         (SELECT COUNT(*) FROM products
          WHERE seller_id = u.user_id
            AND status IN ('SOLD', 'DONATED')) AS completed_transactions
       FROM users u
       WHERE user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];

        // Shape the response to match what the frontend ProfilePage expects
        return res.status(200).json({
            _id: user.user_id,
            name: user.name,
            email: user.email,
            status: user.status,
            greenCredits: user.green_credits,
            memberSince: user.created_at,
            totalListings: user.total_listings,
            completedTransactions: user.completed_transactions,
        });

    } catch (err) {
        console.error('Get profile error:', err);
        return res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/users/listings
// ─────────────────────────────────────────────────────────────
// Returns all listings posted by the logged-in user,
// each with its first image URL (from product_images).
//
// We use LEFT JOIN so that products without any image still appear —
// they just get a null imageUrl, and the frontend handles the fallback.
//
// We also exclude REMOVED listings (soft-deleted by moderation or user).
export const getUserListings = async (req, res) => {
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
         p.moderation_status,
         p.created_at,
         -- Get the URL of the first image uploaded for this product
         -- MIN(image_id) ensures we always pick the same (first) image consistently
         (SELECT image_url FROM product_images
          WHERE product_id = p.product_id
          ORDER BY image_id ASC LIMIT 1) AS image_url
       FROM products p
       WHERE p.seller_id = ?
         AND p.moderation_status != 'REMOVED'
       ORDER BY p.created_at DESC`,
            [userId]
        );

        // Alias product_id → _id for frontend compatibility
        const listings = rows.map((row) => ({
            _id: row.product_id,
            title: row.title,
            category: row.category,
            price: row.price,
            listingType: row.listing_type,
            status: row.status,
            createdAt: row.created_at,
            imageUrl: row.image_url || null,
        }));

        return res.status(200).json(listings);

    } catch (err) {
        console.error('Get user listings error:', err);
        return res.status(500).json({ message: 'Server error fetching listings' });
    }
};
