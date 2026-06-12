import { Router } from 'express'; // Import Express Router to create a modular route handler
import { UserRole } from '@prisma/client'; // Import UserRole enum for role lists in authorize() calls
import { authenticateJWT } from '../middleware/auth.js'; // Import JWT authentication middleware to require a valid token
import { authorize } from '../middleware/rbac.js'; // Import role-based access control middleware
import { StockController } from '../controllers/stockController.js'; // Import the controller handling all stock request operations

const router = Router(); // Create a new router instance for stock routes

router.post('/', // POST /api/stock — branch manager submits a new restock request
  authenticateJWT, // Require a valid JWT token
  authorize([UserRole.BRANCH_MANAGER]), // Only branch managers can create restock requests
  StockController.createRequest, // Handle the request
);

router.get('/mine', // GET /api/stock/mine — branch manager views their branch's restock requests
  authenticateJWT, // Require a valid JWT token
  authorize([UserRole.BRANCH_MANAGER]), // Only branch managers can view their own branch's requests
  StockController.getMyRequests, // Handle the request
);

router.get('/', // GET /api/stock — HQ/admin views all restock requests (optionally filtered by status)
  authenticateJWT, // Require a valid JWT token
  authorize([UserRole.ADMIN, UserRole.HQ_MANAGER]), // Only admins and HQ managers can see all requests
  StockController.getAllRequests, // Handle the request
);

router.patch('/:id', // PATCH /api/stock/:id — HQ/admin updates the status of a restock request
  authenticateJWT, // Require a valid JWT token
  authorize([UserRole.ADMIN, UserRole.HQ_MANAGER]), // Only admins and HQ managers can update request statuses
  StockController.updateStatus, // Handle the request
);

export default router; // Export the router so it can be mounted in index.ts under /api/stock
