import { Request, Response } from 'express'; // Import Express Request and Response types for controller method signatures
import { AuthService } from '../services/authService.js'; // Import the AuthService that handles password hashing and JWT generation
import { UserRole } from '@prisma/client'; // Import the UserRole enum to validate the role field from the request body

export class AuthController { // Controller class grouping all authentication-related request handlers
  static async register(req: Request, res: Response) { // Handles POST /api/auth/register — creates a new user account
    try {
      const { email, password, role, branch_id, firstName, lastName, phoneNumber } = req.body; // Destructure all expected fields from the request body

      if (!email || !password || !role) { // Validate that the three required fields are present
        return res.status(400).json({ message: 'Missing required fields' }); // 400 Bad Request — cannot register without these fields
      }

      if (!Object.values(UserRole).includes(role as UserRole)) { // Check the submitted role is a valid UserRole enum value
        return res.status(400).json({ message: 'Invalid role' }); // 400 Bad Request — reject unknown or invented role strings
      }

      const user = await AuthService.register(email, password, role as UserRole, branch_id ? parseInt(branch_id) : undefined, firstName, lastName, phoneNumber); // Delegate user creation to AuthService which hashes the password and saves to DB

      const response: Record<string, unknown> = { // Build the response object, excluding the password hash
        id: user.id, // Include the new user's generated database ID
        email: user.email, // Include the email they registered with
        role: user.role, // Include the role assigned to the user
        registeredAt: user.registeredAt, // Include the timestamp the account was created
        isActive: user.isActive, // Include whether the account is currently active
      };
      if (user.firstName)   response.firstName   = user.firstName; // Only include firstName if it was provided
      if (user.lastName)    response.lastName    = user.lastName; // Only include lastName if it was provided
      if (user.phoneNumber) response.phoneNumber = user.phoneNumber; // Only include phoneNumber if it was provided

      res.status(201).json(response); // 201 Created — return the new user record (without password)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed'; // Extract the error message safely regardless of error type
      res.status(500).json({ message }); // 500 Internal Server Error — something went wrong during registration
    }
  }

  static async login(req: Request, res: Response) { // Handles POST /api/auth/login — validates credentials and returns a JWT
    try {
      const { email, password } = req.body; // Destructure email and password from the request body

      if (!email || !password) { // Validate both fields are present before attempting login
        return res.status(400).json({ message: 'Email and password are required' }); // 400 Bad Request — incomplete credentials
      }

      const { user, token } = await AuthService.login(email, password); // Authenticate credentials via AuthService; throws if invalid

      const { password_hash, ...userWithoutPassword } = user; // Destructure to strip the password hash from the user object before sending
      res.status(200).json({ user: userWithoutPassword, token }); // 200 OK — return user data and JWT token to the client
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'; // Extract the error message safely
      res.status(401).json({ message }); // 401 Unauthorized — wrong credentials or deactivated account
    }
  }
}
