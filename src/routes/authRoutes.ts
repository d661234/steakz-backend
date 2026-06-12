import { Router } from 'express'; // Import Express Router to create a modular route handler
import { AuthController } from '../controllers/authController.js'; // Import the controller that handles register and login logic

const router = Router(); // Create a new router instance for auth routes

router.post('/register', AuthController.register); // POST /api/auth/register — creates a new user account
router.post('/login', AuthController.login); // POST /api/auth/login — validates credentials and returns a JWT token

export default router; // Export the router so it can be mounted in index.ts under /api/auth
