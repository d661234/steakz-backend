import { Router } from 'express';
import { HQController } from '../controllers/hqController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);
router.use(authorize([UserRole.HQ_MANAGER, UserRole.SYSTEM_ADMIN]));

router.get('/analytics/sales', HQController.getSalesAnalytics);
router.get('/reports/branches', HQController.getBranchPerformance);
router.get('/staff', HQController.getAllStaff);
router.post('/staff/assign', HQController.assignStaffToBranch);

export default router;
