import { Router } from 'express';
import { upload } from '../config/multer.js';
import authMiddleware from '../middleware/auth.js';
import checkActiveStatus from '../middleware/checkActiveStatus.js';
import {
    getProducts,
    getProductById,
    getProductPrimaryImage,
    createListing,
    deleteListing,
} from '../controllers/productController.js';
import { updateProductStatus } from '../controllers/statusController.js';

const router = Router();

// Public — no login required to browse
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/products/:id/image', getProductPrimaryImage);

// Protected — JWT required + ACTIVE status
// upload.single('image') accepts the file but the controller only saves it
// if an image bucket is configured (req.file guard in createListing)
router.post('/listings', authMiddleware, checkActiveStatus, upload.single('image'), createListing);
router.delete('/products/:id', authMiddleware, checkActiveStatus, deleteListing);

// Update product status (SOLD/DONATED) with green credits logic
router.patch('/products/:id/status', authMiddleware, checkActiveStatus, updateProductStatus);

export default router;
