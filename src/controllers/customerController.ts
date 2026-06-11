import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { UserService } from '../services/userService.js';
import { OrderService } from '../services/orderService.js';
import { RecommendationService } from '../services/recommendationService.js';
import { AuthRequest } from '../middleware/auth.js';

const id = (p: string | string[]) => parseInt(p as string);

export class CustomerController {
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const user = await UserService.getUserById(req.user.id);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const user = await UserService.updateUser(req.user.id, req.body);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }

  static async getOrderHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      // Admin sees all orders; customers see only their own
      const orders = req.user.role === 'ADMIN'
        ? await OrderService.getAllOrders()
        : await OrderService.getOrdersByCustomer(req.user.id);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch order history' });
    }
  }

  static async getFavourites(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const favourites = await UserService.getFavouriteItems(req.user.id);
      res.status(200).json(favourites);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch favourites' });
    }
  }

  static async toggleFavourite(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const itemId = id(req.params.itemId);

      const menuItem = await prisma.menuItem.findUnique({ where: { id: itemId } });
      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      const favourites = await UserService.getFavouriteItems(req.user.id);
      const alreadyFavourite = favourites.some(item => item.id === itemId);

      const updatedUser = alreadyFavourite
        ? await UserService.removeFavouriteItem(req.user.id, itemId)
        : await UserService.addFavouriteItem(req.user.id, itemId);

      res.status(200).json(updatedUser.favouriteItems);
    } catch (error) {
      res.status(500).json({ message: 'Failed to toggle favourite item' });
    }
  }

  static async getRecommendations(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const recommendations = await RecommendationService.getRecommendationsBasedOnFavourites(req.user.id);
      res.status(200).json(recommendations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
  }

  static async reorder(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const orderId = id(req.params.orderId);
      const order = await RecommendationService.getOneClickReorder(req.user.id, orderId);
      res.status(201).json(order);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reorder';
      res.status(500).json({ message });
    }
  }
}
