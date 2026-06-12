import bcrypt from 'bcryptjs'; // Import bcrypt for hashing passwords before storing and comparing on login
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for generating signed JWT tokens after successful login
import prisma from '../lib/prisma.js'; // Import the shared Prisma client singleton for database operations
import { UserRole } from '@prisma/client'; // Import the UserRole enum for typing the role parameter

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_me'; // Read JWT signing secret from environment variable; fallback is insecure and for local dev only
const JWT_EXPIRES_IN = '1d'; // JWT tokens expire after 1 day, requiring users to log in again

export class AuthService { // Service class handling all authentication business logic
  static async register(email: string, password: string, role: UserRole, branch_id?: number, firstName?: string, lastName?: string, phoneNumber?: string) { // Creates a new user with a hashed password
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the plain-text password with 10 salt rounds before storing

    const user = await prisma.user.create({ // Persist the new user record in the database
      data: {
        email, // Store the user's email address
        password_hash: hashedPassword, // Store the bcrypt hash, never the plain-text password
        role, // Store the user's assigned role
        branch_id, // Store branch association if provided (optional)
        firstName, // Store first name if provided (optional)
        lastName, // Store last name if provided (optional)
        phoneNumber, // Store phone number if provided (optional)
      },
    });

    return user; // Return the created user record (including all fields including password_hash — caller must strip it)
  }

  static async login(email: string, password: string) { // Validates credentials and returns the user and a signed JWT token
    const user = await prisma.user.findUnique({ // Look up the user by their unique email address
      where: { email }, // Filter by email
    });

    if (!user) { // No user found with this email
      throw new Error('Invalid email or password'); // Throw generic message to avoid revealing whether the email exists
    }

    if (!user.isActive) { // The account exists but has been deactivated by an admin
      throw new Error('Your account has been deactivated. Please contact an administrator.'); // Throw a specific message explaining why login failed
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash); // Compare the submitted plain-text password against the stored hash

    if (!isPasswordValid) { // Password did not match
      throw new Error('Invalid email or password'); // Same generic message as missing user to prevent credential enumeration
    }

    const token = jwt.sign( // Sign a JWT with the user's key identity fields
      { id: user.id, role: user.role, branch_id: user.branch_id }, // Payload: embed ID, role, and branch into the token for use by middleware
      JWT_SECRET, // Sign with the application secret
      { expiresIn: JWT_EXPIRES_IN } // Set token expiry to 1 day
    );

    return { user, token }; // Return both the full user record and the signed JWT token
  }
}
