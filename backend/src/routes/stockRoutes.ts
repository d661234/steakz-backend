import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticateJWT } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { StockController } from '../controllers/stockController.js';

const router = Router();

router.post('/',
  authenticateJWT,
  authorize([UserRole.BRANCH_MANAGER]),
  StockController.createRequest,
);

router.get('/mine',
  authenticateJWT,
  authorize([UserRole.BRANCH_MANAGER]),
  StockController.getMyRequests,
);

router.get('/',
  authenticateJWT,
  authorize([UserRole.ADMIN, UserRole.HQ_MANAGER]),
  StockController.getAllRequests,
);

router.patch('/:id',
  authenticateJWT,
  authorize([UserRole.ADMIN, UserRole.HQ_MANAGER]),
  StockController.updateStatus,
);

export default router;
