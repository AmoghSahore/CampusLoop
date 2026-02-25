import { Router } from 'express';
import { upload } from '../config/multer.js';
import authMiddleware from '../middleware/auth.js';
import {
    getProducts,
    getProductById,
    createListing,
    deleteListing,
} from '../controllers/productController.js';

const router = Router();

// Public — no login required to browse
router.get('/products', getProducts);
router.get('/products/:id', getProductById);

// Protected — JWT required
// upload.single('image') accepts the file but the controller only saves it
// if an image bucket is configured (req.file guard in createListing)
router.post('/listings', authMiddleware, upload.single('image'), createListing);
router.delete('/products/:id', authMiddleware, deleteListing);

export default router;
