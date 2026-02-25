import pool from '../config/db.js';

// ─────────────────────────────────────────────────────────────
// GET /api/products
// ─────────────────────────────────────────────────────────────
// Lists products visible to the public. Only shows listings where
// moderation_status = 'ACTIVE' and status = 'AVAILABLE'.
//
// Supports optional query params:
//   ?search=laptop        — partial match on title or description
//   ?category=Electronics — exact category match
//   ?type=sell            — listing type (sell/rent/donate → SELL/RENT/DONATE)
export const getProducts = async (req, res) => {
    try {
        const { search, category, type } = req.query;

        // We build the WHERE clause dynamically based on which filters are provided.
        // Using an array of conditions + params array keeps the code clean and
        // prevents SQL injection (values still go via prepared statement placeholders).
        const conditions = [
            "p.moderation_status = 'ACTIVE'",
            "p.status = 'AVAILABLE'",
        ];
        const params = [];

        if (search) {
            // LIKE with wildcards lets us do partial text matching.
            // We search both title and description so results are thorough.
            conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category) {
            conditions.push('p.category = ?');
            params.push(category);
        }

        if (type) {
            // The frontend sends lowercase ('sell'), our DB enum is uppercase ('SELL')
            conditions.push('p.listing_type = ?');
            params.push(type.toUpperCase());
        }

        const whereClause = conditions.join(' AND ');

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
         -- Subquery: grab the first uploaded image for this product
         (SELECT image_url FROM product_images
          WHERE product_id = p.product_id
          ORDER BY image_id ASC LIMIT 1) AS image_url
       FROM products p
       JOIN users u ON p.seller_id = u.user_id
       WHERE ${whereClause}
       ORDER BY p.created_at DESC`,
            params
        );

        // Shape the response to match what ProductCard and Listings.jsx expect
        const products = rows.map((row) => ({
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
        }));

        return res.status(200).json(products);

    } catch (err) {
        console.error('Get products error:', err);
        return res.status(500).json({ message: 'Server error fetching products' });
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/products/:id
// ─────────────────────────────────────────────────────────────
// Returns full details for a single product, including:
//   - All image URLs (not just the first one)
//   - Seller name and email (so the buyer knows who to contact)
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the product + seller info in one query
        const [rows] = await pool.execute(
            `SELECT
         p.*,
         u.name  AS seller_name,
         u.email AS seller_email
       FROM products p
       JOIN users u ON p.seller_id = u.user_id
       WHERE p.product_id = ?
         AND p.moderation_status != 'REMOVED'`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = rows[0];

        // Fetch all images for this product separately
        const [images] = await pool.execute(
            'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY image_id ASC',
            [id]
        );

        return res.status(200).json({
            _id: product.product_id,
            title: product.title,
            description: product.description,
            category: product.category,
            price: product.price,
            listingType: product.listing_type,
            status: product.status,
            createdAt: product.created_at,
            // First image is the main display image; rest are extras
            imageUrl: images[0]?.image_url || null,
            images: images.map((img) => img.image_url),
            seller: {
                name: product.seller_name,
                email: product.seller_email,
            },
        });

    } catch (err) {
        console.error('Get product by id error:', err);
        return res.status(500).json({ message: 'Server error fetching product' });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/listings  (auth required)
// ─────────────────────────────────────────────────────────────
// Creates a new product listing. The frontend sends multipart/form-data
// so multer processes the uploaded image before this handler runs.
// req.file is set by multer with info about the saved file.
export const createListing = async (req, res) => {
    try {
        const { title, category, price, description, listingType } = req.body;
        const sellerId = req.user.userId; // from JWT — we know who's posting

        // Server-side validation
        if (!title || !category || !price || !description) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate and normalise listingType — default to SELL if omitted
        const validTypes = ['SELL', 'RENT', 'DONATE'];
        const dbListingType = listingType ? listingType.toUpperCase() : 'SELL';
        if (!validTypes.includes(dbListingType)) {
            return res.status(400).json({ message: 'Invalid listing type' });
        }

        // Insert the product row (image is optional for now)
        const [result] = await pool.execute(
            `INSERT INTO products (seller_id, title, description, category, price, listing_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [sellerId, title.trim(), description.trim(), category, parseFloat(price), dbListingType]
        );

        const newProductId = result.insertId;

        // Only store an image if one was actually uploaded
        if (req.file) {
            const imageUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
            await pool.execute(
                'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
                [newProductId, imageUrl]
            );
        }

        return res.status(201).json({
            message: 'Listing created successfully',
            productId: newProductId,
        });

    } catch (err) {
        console.error('Create listing error:', err);
        return res.status(500).json({ message: 'Server error creating listing' });
    }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/products/:id  (auth required)
// ─────────────────────────────────────────────────────────────
// Soft-deletes a listing by setting moderation_status = 'REMOVED'.
// We never hard-delete rows — this preserves data integrity and lets
// admins review removed content if needed.
// Only the owner of the listing can delete it.
export const deleteListing = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // First confirm this product exists AND belongs to the requesting user.
        // This prevents one user from deleting another user's listing.
        const [rows] = await pool.execute(
            'SELECT seller_id FROM products WHERE product_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (rows[0].seller_id !== userId) {
            // 403 = Forbidden (authenticated but not authorized to do this action)
            return res.status(403).json({ message: 'You can only delete your own listings' });
        }

        // Soft delete — update the status flag instead of running DELETE
        await pool.execute(
            "UPDATE products SET moderation_status = 'REMOVED' WHERE product_id = ?",
            [id]
        );

        return res.status(200).json({ message: 'Listing removed successfully' });

    } catch (err) {
        console.error('Delete listing error:', err);
        return res.status(500).json({ message: 'Server error removing listing' });
    }
};
