import { Router } from 'express';
import adminAuthMiddleware from '../middleware/adminAuth.js';
import {
  getAdminSummary,
  getUsers,
  getProducts,
  getReports,
  updateReportStatus,
  getAppeals,
  updateAppealStatus,
  updateUserStatusByAdmin,
  updateProductModerationStatus,
  getAdminLogs,
} from '../controllers/adminController.js';

const router = Router();

router.use(adminAuthMiddleware);

router.get('/summary', getAdminSummary);

router.get('/users', getUsers);
router.get('/products', getProducts);

router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

router.get('/appeals', getAppeals);
router.patch('/appeals/:id', updateAppealStatus);

router.patch('/users/:id/status', updateUserStatusByAdmin);
router.patch('/products/:id/moderation', updateProductModerationStatus);

router.get('/logs', getAdminLogs);

export default router;
