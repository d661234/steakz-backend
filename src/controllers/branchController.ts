import { Request, Response } from 'express';
import { BranchService } from '../services/branchService.js';
import { MenuService } from '../services/menuService.js';

const id   = (p: string | string[]) => parseInt(p as string);

export class BranchController {
  // Branch Operations
  static async getAllBranches(_req: Request, res: Response) {
    try {
      const branches = await BranchService.getAllBranches();
      res.status(200).json(branches);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch branches' });
    }
  }

  static async getPublicBranches(_req: Request, res: Response) {
    try {
      const branches = await BranchService.getPublicBranches();
      res.status(200).json(branches);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch public branches' });
    }
  }

  static async getPublicMenuByBranch(req: Request, res: Response) {
    try {
      const menu = await BranchService.getPublicMenuByBranch(id(req.params.branchId));
      res.status(200).json(menu);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch public menu' });
    }
  }

  static async getBranchById(req: Request, res: Response) {
    try {
      const branch = await BranchService.getBranchById(id(req.params.id));
      if (!branch) return res.status(404).json({ message: 'Branch not found' });
      res.status(200).json(branch);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch branch' });
    }
  }

  static async createBranch(req: Request, res: Response) {
    try {
      const branch = await BranchService.createBranch(req.body);
      res.status(201).json(branch);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create branch' });
    }
  }

  static async updateBranch(req: Request, res: Response) {
    try {
      const branch = await BranchService.updateBranch(id(req.params.id), req.body);
      res.status(200).json(branch);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update branch' });
    }
  }

  static async deleteBranch(req: Request, res: Response) {
    try {
      await BranchService.deleteBranch(id(req.params.id));
      res.status(200).json({ message: 'Branch deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete branch';
      res.status(500).json({ message });
    }
  }

  // Menu Operations
  static async getMenuByBranch(req: Request, res: Response) {
    try {
      const menu = await MenuService.getMenuByBranch(id(req.params.branchId));
      res.status(200).json(menu);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch menu' });
    }
  }

  static async createMenuItem(req: Request, res: Response) {
    try {
      const menuItem = await MenuService.createMenuItem({
        ...req.body,
        branch_id: id(req.params.branchId),
      });
      res.status(201).json(menuItem);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create menu item' });
    }
  }

  static async updateMenuItem(req: Request, res: Response) {
    try {
      const menuItem = await MenuService.updateMenuItem(id(req.params.id), req.body);
      res.status(200).json(menuItem);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update menu item' });
    }
  }

  static async deleteMenuItem(req: Request, res: Response) {
    try {
      await MenuService.deleteMenuItem(id(req.params.id));
      res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete menu item';
      res.status(500).json({ message });
    }
  }
}
