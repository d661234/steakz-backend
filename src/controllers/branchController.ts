import { Request, Response } from 'express'; // Import Express types for request and response objects
import { BranchService } from '../services/branchService.js'; // Import BranchService handling all branch-level database operations
import { MenuService } from '../services/menuService.js'; // Import MenuService handling menu item database operations

const id   = (p: string | string[]) => parseInt(p as string); // Helper that converts a URL route parameter (always a string) to an integer

export class BranchController { // Controller class grouping all branch and menu request handlers
  // Branch Operations
  static async getAllBranches(_req: Request, res: Response) { // Handles GET /api/branches — returns all branches with counts
    try {
      const branches = await BranchService.getAllBranches(); // Fetch all branches including staff, menu, order, and alert counts
      res.status(200).json(branches); // 200 OK — return the full branches list
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch branches' }); // 500 Internal Server Error — database query failed
    }
  }

  static async getPublicBranches(_req: Request, res: Response) { // Handles GET /api/branches/public — returns active branches for unauthenticated users
    try {
      const branches = await BranchService.getPublicBranches(); // Fetch only active branches with their available menu items
      res.status(200).json(branches); // 200 OK — return the public-facing branches list
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch public branches' }); // 500 Internal Server Error — database query failed
    }
  }

  static async getPublicMenuByBranch(req: Request, res: Response) { // Handles GET /api/branches/public/:branchId/menu — public menu for a branch
    try {
      const menu = await BranchService.getPublicMenuByBranch(id(req.params.branchId)); // Fetch all menu items for the given branch ID
      res.status(200).json(menu); // 200 OK — return the menu items array
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch public menu' }); // 500 Internal Server Error — database query failed
    }
  }

  static async getBranchById(req: Request, res: Response) { // Handles GET /api/branches/:id — returns full details of a single branch
    try {
      const branch = await BranchService.getBranchById(id(req.params.id)); // Fetch the branch with staff, menu items, and alerts
      if (!branch) return res.status(404).json({ message: 'Branch not found' }); // 404 Not Found — no branch exists with that ID
      res.status(200).json(branch); // 200 OK — return the branch detail object
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch branch' }); // 500 Internal Server Error — database query failed
    }
  }

  static async createBranch(req: Request, res: Response) { // Handles POST /api/branches — creates a new branch
    try {
      const branch = await BranchService.createBranch(req.body); // Delegate to BranchService with the request body as creation data
      res.status(201).json(branch); // 201 Created — return the newly created branch record
    } catch (error) {
      res.status(500).json({ message: 'Failed to create branch' }); // 500 Internal Server Error — creation failed
    }
  }

  static async updateBranch(req: Request, res: Response) { // Handles PUT /api/branches/:id — updates branch fields
    try {
      const branch = await BranchService.updateBranch(id(req.params.id), req.body); // Pass the branch ID and updated fields to BranchService
      res.status(200).json(branch); // 200 OK — return the updated branch record
    } catch (error) {
      res.status(500).json({ message: 'Failed to update branch' }); // 500 Internal Server Error — update failed
    }
  }

  static async deleteBranch(req: Request, res: Response) { // Handles DELETE /api/branches/:id — removes a branch and all its data
    try {
      await BranchService.deleteBranch(id(req.params.id)); // Delegate to BranchService which runs a transaction to clean up all related data
      res.status(200).json({ message: 'Branch deleted successfully' }); // 200 OK — confirm deletion
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete branch'; // Extract error message safely
      res.status(500).json({ message }); // 500 Internal Server Error — deletion failed
    }
  }

  // Menu Operations
  static async getMenuByBranch(req: Request, res: Response) { // Handles GET /api/branches/:branchId/menu — returns all menu items for a branch
    try {
      const menu = await MenuService.getMenuByBranch(id(req.params.branchId)); // Fetch menu items filtered by branch ID
      res.status(200).json(menu); // 200 OK — return the menu items array
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch menu' }); // 500 Internal Server Error — database query failed
    }
  }

  static async createMenuItem(req: Request, res: Response) { // Handles POST /api/branches/:branchId/menu — adds a new item to the branch menu
    try {
      const menuItem = await MenuService.createMenuItem({ // Spread the request body and inject the branch ID from the URL
        ...req.body, // Include all menu item fields sent in the body (name, price, category, etc.)
        branch_id: id(req.params.branchId), // Override/set branch_id from the URL param to ensure correct branch association
      });
      res.status(201).json(menuItem); // 201 Created — return the newly created menu item
    } catch (error) {
      res.status(500).json({ message: 'Failed to create menu item' }); // 500 Internal Server Error — creation failed
    }
  }

  static async updateMenuItem(req: Request, res: Response) { // Handles PUT /api/branches/menu/:id — updates an existing menu item
    try {
      const menuItem = await MenuService.updateMenuItem(id(req.params.id), req.body); // Update the menu item by ID with the provided fields
      res.status(200).json(menuItem); // 200 OK — return the updated menu item
    } catch (error) {
      res.status(500).json({ message: 'Failed to update menu item' }); // 500 Internal Server Error — update failed
    }
  }

  static async deleteMenuItem(req: Request, res: Response) { // Handles DELETE /api/branches/menu/:id — removes a menu item and its order references
    try {
      await MenuService.deleteMenuItem(id(req.params.id)); // Delegate to MenuService which removes related order items first, then the item
      res.status(200).json({ message: 'Menu item deleted successfully' }); // 200 OK — confirm deletion
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete menu item'; // Extract error message safely
      res.status(500).json({ message }); // 500 Internal Server Error — deletion failed
    }
  }
}
