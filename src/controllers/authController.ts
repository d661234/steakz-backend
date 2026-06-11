import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { UserRole } from '@prisma/client';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, role, branch_id, firstName, lastName, phoneNumber } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (!Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      const user = await AuthService.register(email, password, role as UserRole, branch_id ? parseInt(branch_id) : undefined, firstName, lastName, phoneNumber);

      const response: Record<string, unknown> = {
        id: user.id,
        email: user.email,
        role: user.role,
        registeredAt: user.registeredAt,
        isActive: user.isActive,
      };
      if (user.firstName)   response.firstName   = user.firstName;
      if (user.lastName)    response.lastName    = user.lastName;
      if (user.phoneNumber) response.phoneNumber = user.phoneNumber;

      res.status(201).json(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(500).json({ message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const { user, token } = await AuthService.login(email, password);
      
      const { password_hash, ...userWithoutPassword } = user;
      res.status(200).json({ user: userWithoutPassword, token });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ message });
    }
  }
}
