import pool from '../config/db.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// ─────────────────────────────────────────────────────────────
// POST /api/upload-image
// ─────────────────────────────────────────────────────────────
// Upload multiple images for a product:
//   1. Validate product_id and files
//   2. Verify product ownership (seller_id matches current user)
//   3. Upload each file to Cloudinary
//   4. Store secure_url in product_images table
//   5. Return array of saved image records

export const uploadProductImages = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.userId;
    const files = req.files;

    // Validation: require product_id and at least one file
    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'At least one image file is required' });
    }

    // Check if product exists and belongs to the current user
    const [productRows] = await pool.execute(
      'SELECT seller_id FROM products WHERE product_id = ?',
      [product_id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (productRows[0].seller_id !== userId) {
      return res.status(403).json({
        message: 'You can only upload images for your own products',
      });
    }

    // Upload files to Cloudinary and save URLs to database
    const uploadedImages = [];

    for (const file of files) {
      try {
        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(file, 'campusloop/products');

        // Insert image URL into product_images table
        const [insertResult] = await pool.execute(
          'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
          [product_id, uploadResult.secure_url]
        );

        uploadedImages.push({
          image_id: insertResult.insertId,
          product_id: parseInt(product_id),
          image_url: uploadResult.secure_url,
        });
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        // Continue with other files even if one fails
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({
        message: 'Failed to upload any images. Please try again.',
      });
    }

    return res.status(201).json({
      message: `Successfully uploaded ${uploadedImages.length} image(s)`,
      images: uploadedImages,
    });
  } catch (err) {
    console.error('Upload images error:', err);
    return res.status(500).json({ message: 'Server error uploading images' });
  }
};
