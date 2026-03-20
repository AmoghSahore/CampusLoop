import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import checkActiveStatus from '../middleware/checkActiveStatus.js';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlistItems,
} from '../controllers/wishlistController.js';

const router = Router();

router.get('/', authMiddleware, getWishlistItems);
router.post('/:productId', authMiddleware, checkActiveStatus, addToWishlist);
router.delete('/:productId', authMiddleware, checkActiveStatus, removeFromWishlist);

export default router;
