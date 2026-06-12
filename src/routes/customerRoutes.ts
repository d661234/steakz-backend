import { Router } from 'express'; // Import Express Router to create a modular route handler
import { CustomerController } from '../controllers/customerController.js'; // Import the controller handling all customer-facing operations
import { authenticateJWT } from '../middleware/auth.js'; // Import JWT authentication middleware to require a valid token
import { authorize } from '../middleware/rbac.js'; // Import role-based access control middleware
import { UserRole } from '@prisma/client'; // Import UserRole enum for the authorize() role list

const router = Router(); // Create a new router instance for customer routes

router.use(authenticateJWT); // Apply JWT authentication to every route in this router — all customer routes require login
router.use(authorize([UserRole.CUSTOMER, UserRole.ADMIN])); // Restrict all routes to customers and admins (admins included for support/testing)

router.get('/profile', CustomerController.getProfile); // GET /api/customer/profile — returns the authenticated customer's profile
router.put('/profile', CustomerController.updateProfile); // PUT /api/customer/profile — updates the customer's profile fields
router.get('/orders', CustomerController.getOrderHistory); // GET /api/customer/orders — returns the customer's order history (admins see all orders)
router.get('/recommendations', CustomerController.getRecommendations); // GET /api/customer/recommendations — returns personalised menu recommendations based on favourites
router.post('/orders/:orderId/reorder', CustomerController.reorder); // POST /api/customer/orders/:orderId/reorder — duplicates a past order as a new order
router.get('/favourites', CustomerController.getFavourites); // GET /api/customer/favourites — returns the customer's list of favourite menu items
router.post('/favourites/:itemId', CustomerController.toggleFavourite); // POST /api/customer/favourites/:itemId — adds or removes a menu item from the customer's favourites

export default router; // Export the router so it can be mounted in index.ts under /api/customer
