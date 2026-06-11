import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { OrderService } from '../services/orderService.js';
import { AuthRequest } from '../middleware/auth.js';

const id = (p: string | string[]) => parseInt(p as string);

export class OrderController {
  static async getAllOrders(req: AuthRequest, res: Response) {
    try {
      const where = req.user?.branch_id ? { branch_id: req.user.branch_id } : {};
      const orders = await OrderService.getAllOrders(where);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  }

  static async getOrderById(req: AuthRequest, res: Response) {
    try {
      const order = await OrderService.getOrderById(id(req.params.id));
      if (!order) return res.status(404).json({ message: 'Order not found' });

      if (req.user?.branch_id && order.branch_id !== req.user.branch_id) {
        return res.status(403).json({ message: 'Forbidden: Order belongs to another branch' });
      }

      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch order' });
    }
  }

  static async createOrder(req: AuthRequest, res: Response) {
    try {
      const { branch_id, total_amount, items } = req.body;

      // Accept items as a plain array OR already in Prisma's { create: [] } shape
      const itemsArray: Array<{ menuItemId: number; quantity: number; price: number }> =
        Array.isArray(items) ? items : (items?.create ?? []);

      const itemIds = itemsArray.map((i) => Number(i.menuItemId));
      if (itemIds.length > 0) {
        const missing = await OrderService.validateMenuItemsExist(itemIds);
        if (missing.length > 0) {
          return res.status(400).json({ message: `Menu item(s) not found: ${missing.join(', ')}` });
        }
        const soldOut = await OrderService.getUnavailableItems(itemIds);
        if (soldOut.length > 0) {
          return res.status(400).json({ message: `The following items are sold out: ${soldOut.join(', ')}` });
        }
      }

      const order = await OrderService.createOrder({
        branch_id: Number(branch_id),
        total_amount: Number(total_amount),
        customer_id: req.user?.role === 'CUSTOMER' ? req.user.id : (req.body.customer_id ? Number(req.body.customer_id) : undefined),
        items: {
          create: itemsArray.map((i) => ({
            menuItemId: Number(i.menuItemId),
            quantity: Number(i.quantity),
            price: Number(i.price),
          })),
        },
      });
      res.status(201).json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order';
      res.status(500).json({ message });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      const order = await OrderService.updateOrderStatus(id(req.params.id), status);
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update order status' });
    }
  }

  static async createGuestOrder(req: Request, res: Response) {
    try {
      const { branch_id, total_amount, items } = req.body;
      if (!branch_id || !total_amount) {
        return res.status(400).json({ message: 'branch_id and total_amount are required' });
      }

      // Accept items as a plain array OR already in Prisma's { create: [] } shape
      const itemsArray: Array<{ menuItemId: number; quantity: number; price: number }> =
        Array.isArray(items) ? items : (items?.create ?? []);

      const itemIds = itemsArray.map((i) => Number(i.menuItemId));
      if (itemIds.length > 0) {
        const missing = await OrderService.validateMenuItemsExist(itemIds);
        if (missing.length > 0) {
          return res.status(400).json({ message: `Menu item(s) not found: ${missing.join(', ')}` });
        }
        const soldOut = await OrderService.getUnavailableItems(itemIds);
        if (soldOut.length > 0) {
          return res.status(400).json({ message: `The following items are sold out: ${soldOut.join(', ')}` });
        }
      }

      const order = await OrderService.createOrder({
        branch_id: Number(branch_id),
        total_amount: Number(total_amount),
        items: {
          create: itemsArray.map((i) => ({
            menuItemId: Number(i.menuItemId),
            quantity: Number(i.quantity),
            price: Number(i.price),
          })),
        },
      });
      res.status(201).json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create guest order';
      res.status(500).json({ message });
    }
  }

  static async confirmPayment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

      const order = await OrderService.getOrderById(id(req.params.id));
      if (!order) return res.status(404).json({ message: 'Order not found' });

      if (req.user.role === UserRole.CUSTOMER && order.customer_id !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: Order does not belong to customer' });
      }

      const updatedOrder = await OrderService.confirmOrderPayment(id(req.params.id));
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: 'Failed to confirm payment' });
    }
  }
}
