import { Router } from 'express'; // Import Express Router to create a modular route handler
import { AdminController } from '../controllers/adminController.js'; // Import the controller handling all admin user management operations
import { authenticateJWT } from '../middleware/auth.js'; // Import JWT authentication middleware to require a valid token
import { authorize } from '../middleware/rbac.js'; // Import role-based access control middleware to restrict to ADMIN role
import { UserRole } from '@prisma/client'; // Import UserRole enum for use in the authorize() call

const router = Router(); // Create a new router instance for admin routes

// All admin routes are protected and require ADMIN role
router.use(authenticateJWT); // Apply JWT authentication to every route in this router — all admin routes require login
router.use(authorize([UserRole.ADMIN])); // Apply ADMIN-only role restriction to every route in this router

router.get('/users', AdminController.getAllUsers); // GET /api/admin/users — returns all users in the system
router.post('/users', AdminController.createUser); // POST /api/admin/users — creates a new user account via the admin panel
router.get('/users/activity-summary', AdminController.getUserActivitySummary); // GET /api/admin/users/activity-summary — returns user count stats by role and active status
router.get('/users/audit-log', AdminController.getUserAuditLog); // GET /api/admin/users/audit-log — returns the full role change audit trail
router.get('/users/:id', AdminController.getUserById); // GET /api/admin/users/:id — returns a single user's details
router.patch('/users/:id/role', AdminController.changeUserRole); // PATCH /api/admin/users/:id/role — changes a user's role with audit logging
router.patch('/users/:id/deactivate', AdminController.deactivateUser); // PATCH /api/admin/users/:id/deactivate — disables a user account
router.put('/users/:id', AdminController.updateUser); // PUT /api/admin/users/:id — updates user profile fields
router.delete('/users/:id', AdminController.deleteUser); // DELETE /api/admin/users/:id — permanently removes a user

export default router; // Export the router so it can be mounted in index.ts under /api/admin
