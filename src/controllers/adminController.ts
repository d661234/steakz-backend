import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.js';
import { UserService } from '../services/userService.js';
import { RoleService } from '../services/roleService.js';
import { UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client';

const id = (p: string | string[]) => parseInt(p as string);

export class AdminController {
  static async createUser(req: Request, res: Response) {
    try {
      const { email, password, role, firstName, lastName, branch_id } = req.body;
      if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password and role are required' });
      }
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      const password_hash = await bcrypt.hash(password, 10);
      const user = await UserService.createUser({
        email,
        password_hash,
        role: role as UserRole,
        firstName: firstName || null,
        lastName: lastName || null,
        ...(branch_id ? { branch: { connect: { id: parseInt(branch_id) } } } : {}),
      });
      const { password_hash: _p, ...safe } = user;
      res.status(201).json(safe);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ message: 'A user with that email already exists' });
      }
      const message = error instanceof Error ? error.message : 'Failed to create user';
      res.status(500).json({ message });
    }
  }

  static async getAllUsers(_req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error: unknown) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await UserService.getUserById(id(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error: unknown) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, role, branch_id } = req.body;

      const data: Prisma.UserUpdateInput = {
        ...(firstName !== undefined && { firstName }),
        ...(lastName  !== undefined && { lastName }),
        ...(email     !== undefined && { email }),
        ...(role      !== undefined && { role: role as UserRole }),
        ...(branch_id !== undefined && (
          branch_id
            ? { branch: { connect: { id: parseInt(branch_id) } } }
            : { branch: { disconnect: true } }
        )),
      };

      const user = await UserService.updateUser(id(req.params.id), data);
      const { password_hash: _p, ...safe } = user;
      res.status(200).json(safe);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      res.status(500).json({ message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      await UserService.deleteUser(id(req.params.id));
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: unknown) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  }

  static async changeUserRole(req: AuthRequest, res: Response) {
    try {
      const userId = id(req.params.id);
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ message: 'Role is required' });
      }

      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const updatedUser = await RoleService.changeUserRole(adminId, userId, role);
      const { password_hash: _p, ...safe } = updatedUser;
      res.status(200).json(safe);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to change user role';
      res.status(500).json({ message });
    }
  }

  static async deactivateUser(req: AuthRequest, res: Response) {
    try {
      const userId = id(req.params.id);
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await RoleService.deactivateUser(adminId, userId);
      res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to deactivate user';
      res.status(500).json({ message });
    }
  }

  static async getUserActivitySummary(_req: Request, res: Response) {
    try {
      const summary = await RoleService.getUserActivitySummary();
      res.status(200).json(summary);
    } catch (error: unknown) {
      res.status(500).json({ message: 'Failed to fetch user activity summary' });
    }
  }

  static async getUserAuditLog(_req: Request, res: Response) {
    try {
      const auditEntries = await RoleService.getRoleChangeAudit();
      res.status(200).json(auditEntries);
    } catch (error: unknown) {
      res.status(500).json({ message: 'Failed to fetch user audit log' });
    }
  }
}
