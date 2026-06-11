import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Public guest order — no authentication required
router.post('/guest', OrderController.createGuestOrder);

router.use(authenticateJWT);

// Waiter, HQ Manager, Admin can view orders (Branch Manager cannot per RBAC design)
router.get('/', authorize([UserRole.WAITER, UserRole.HQ_MANAGER, UserRole.ADMIN]), OrderController.getAllOrders);
router.get('/:id', authorize([UserRole.WAITER, UserRole.HQ_MANAGER, UserRole.ADMIN]), OrderController.getOrderById);

// Customers can create orders
router.post('/', authorize([UserRole.CUSTOMER, UserRole.WAITER, UserRole.ADMIN]), OrderController.createOrder);

// Status updates — Waiter and Admin only (Branch Manager cannot access orders)
router.patch('/:id/status', authorize([UserRole.WAITER, UserRole.ADMIN]), OrderController.updateStatus);
router.patch('/:id/confirm', authorize([UserRole.CUSTOMER, UserRole.WAITER, UserRole.ADMIN]), OrderController.confirmPayment);

export default router;
