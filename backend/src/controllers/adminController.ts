import { Request, Response } from 'express';
import { UserService } from '../services/userService.js';

export class AdminController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error: unknown) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await UserService.getUserById(req.params.id as string);
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
      const user = await UserService.updateUser(req.params.id as string, req.body);
      res.status(200).json(user);
    } catch (error: unknown) {
      res.status(500).json({ message: 'Failed to update user' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      await UserService.deleteUser(req.params.id as string);
      res.status(204).send();
    } catch (error: unknown) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  }
}
