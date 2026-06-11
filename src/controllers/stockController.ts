import { Response } from 'express';
import { StockRequestStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { StockService } from '../services/stockService.js';
import prisma from '../lib/prisma.js';

const id = (p: string | string[]) => parseInt(p as string);

export class StockController {
  static async createRequest(req: AuthRequest, res: Response) {
    try {
      const { item_name, quantity, unit, notes } = req.body;
      if (!item_name || !quantity) {
        return res.status(400).json({ message: 'item_name and quantity are required' });
      }

      let branch_id = req.user?.branch_id;
      if (!branch_id && req.user?.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { branch_id: true } });
        branch_id = dbUser?.branch_id ?? undefined;
      }

      if (!branch_id) {
        return res.status(400).json({ message: 'No branch associated with your account' });
      }

      const request = await StockService.createRequest({
        branch_id,
        requestedBy: req.user?.id,
        item_name,
        quantity: Number(quantity),
        unit: unit ?? 'units',
        notes: notes || undefined,
      });
      res.status(201).json(request);
    } catch (err) {
      console.error('createRequest error:', err);
      res.status(500).json({ message: 'Failed to create restock request' });
    }
  }

  static async getMyRequests(req: AuthRequest, res: Response) {
    try {
      let branch_id = req.user?.branch_id;
      if (!branch_id && req.user?.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { branch_id: true } });
        branch_id = dbUser?.branch_id ?? undefined;
      }
      if (!branch_id) return res.status(200).json([]);
      const requests = await StockService.getAllRequests({ branch_id });
      res.status(200).json(requests);
    } catch (err) {
      console.error('getMyRequests error:', err);
      res.status(500).json({ message: 'Failed to fetch restock requests' });
    }
  }

  static async getAllRequests(req: AuthRequest, res: Response) {
    try {
      const status = req.query.status as StockRequestStatus | undefined;
      const requests = await StockService.getAllRequests(status ? { status } : undefined);
      res.status(200).json(requests);
    } catch (err) {
      console.error('getAllRequests error:', err);
      res.status(500).json({ message: 'Failed to fetch restock requests' });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ message: 'status is required' });
      const updated = await StockService.updateStatus(id(req.params.id), status as StockRequestStatus);
      res.status(200).json(updated);
    } catch (err) {
      console.error('updateStatus error:', err);
      res.status(500).json({ message: 'Failed to update restock request' });
    }
  }
}
