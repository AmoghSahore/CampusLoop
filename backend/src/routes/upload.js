import { Router } from 'express';
import { upload } from '../config/multer.js';
import authMiddleware from '../middleware/auth.js';
import checkActiveStatus from '../middleware/checkActiveStatus.js';
import { uploadProductImages } from '../controllers/uploadController.js';

const router = Router();

// POST /api/upload-image — Upload multiple images for a product
// Requires:
//   - JWT authentication
//   - ACTIVE user status
//   - Product ownership verification (done in controller)
// Body: multipart/form-data with product_id and multiple image files
router.post(
  '/upload-image',
  authMiddleware,
  checkActiveStatus,
  upload.array('images', 10), // Accept up to 10 images
  uploadProductImages
);

export default router;
