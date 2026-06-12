import { Response } from 'express'; // Import Express Response type for handler return types
import { StockRequestStatus } from '@prisma/client'; // Import the StockRequestStatus enum for type-safe status filtering
import { AuthRequest } from '../middleware/auth.js'; // Import the extended request type carrying the authenticated user payload
import { StockService } from '../services/stockService.js'; // Import StockService for all stock request database operations
import prisma from '../lib/prisma.js'; // Import the shared Prisma client to look up the user's branch when the JWT doesn't carry it

const id = (p: string | string[]) => parseInt(p as string); // Helper converting a URL route parameter string to an integer

export class StockController { // Controller class grouping all stock/restock request handlers
  static async createRequest(req: AuthRequest, res: Response) { // Handles POST /api/stock — creates a new restock request for the branch manager's branch
    try {
      const { item_name, quantity, unit, notes } = req.body; // Destructure required and optional fields from the request body
      if (!item_name || !quantity) { // Validate the two required fields are present
        return res.status(400).json({ message: 'item_name and quantity are required' }); // 400 Bad Request — cannot create request without these
      }

      let branch_id = req.user?.branch_id; // Try to get branch_id directly from the JWT payload first
      if (!branch_id && req.user?.id) { // JWT may not carry branch_id if the token was issued before branch assignment
        const dbUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { branch_id: true } }); // Fall back to fetching the user's current branch from the database
        branch_id = dbUser?.branch_id ?? undefined; // Use the DB value, or undefined if still not set
      }

      if (!branch_id) { // Branch managers must be associated with a branch to submit requests
        return res.status(400).json({ message: 'No branch associated with your account' }); // 400 Bad Request — cannot submit stock request without a branch
      }

      const request = await StockService.createRequest({ // Delegate stock request creation to StockService
        branch_id, // The branch the request is for
        requestedBy: req.user?.id, // The user who submitted the request (for audit purposes)
        item_name, // The name of the item to restock
        quantity: Number(quantity), // Coerce to number in case it arrived as a string
        unit: unit ?? 'units', // Default unit to 'units' if not provided
        notes: notes || undefined, // Convert empty string to undefined to avoid storing blank notes
      });
      res.status(201).json(request); // 201 Created — return the new stock request record
    } catch (err) {
      console.error('createRequest error:', err); // Log the full error for server-side debugging
      res.status(500).json({ message: 'Failed to create restock request' }); // 500 Internal Server Error — creation failed
    }
  }

  static async getMyRequests(req: AuthRequest, res: Response) { // Handles GET /api/stock/mine — returns stock requests for the current user's branch
    try {
      let branch_id = req.user?.branch_id; // Try to get branch_id from the JWT payload first
      if (!branch_id && req.user?.id) { // Fall back to DB lookup if not in token
        const dbUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { branch_id: true } }); // Fetch branch_id from the database for this user
        branch_id = dbUser?.branch_id ?? undefined; // Use the DB value, or undefined if still unset
      }
      if (!branch_id) return res.status(200).json([]); // Return empty array if user has no branch — graceful fallback
      const requests = await StockService.getAllRequests({ branch_id }); // Fetch only requests belonging to the user's branch
      res.status(200).json(requests); // 200 OK — return the branch's stock request list
    } catch (err) {
      console.error('getMyRequests error:', err); // Log the full error for server-side debugging
      res.status(500).json({ message: 'Failed to fetch restock requests' }); // 500 Internal Server Error — query failed
    }
  }

  static async getAllRequests(req: AuthRequest, res: Response) { // Handles GET /api/stock — returns all stock requests, optionally filtered by status
    try {
      const status = req.query.status as StockRequestStatus | undefined; // Extract optional status filter from the query string
      const requests = await StockService.getAllRequests(status ? { status } : undefined); // Apply status filter if provided, otherwise fetch all requests
      res.status(200).json(requests); // 200 OK — return the stock requests array
    } catch (err) {
      console.error('getAllRequests error:', err); // Log the full error for server-side debugging
      res.status(500).json({ message: 'Failed to fetch restock requests' }); // 500 Internal Server Error — query failed
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) { // Handles PATCH /api/stock/:id — updates the status of a stock request
    try {
      const { status } = req.body; // Extract the new status value from the request body
      if (!status) return res.status(400).json({ message: 'status is required' }); // 400 Bad Request — cannot update without a target status
      const updated = await StockService.updateStatus(id(req.params.id), status as StockRequestStatus); // Update the stock request status via StockService
      res.status(200).json(updated); // 200 OK — return the updated stock request
    } catch (err) {
      console.error('updateStatus error:', err); // Log the full error for server-side debugging
      res.status(500).json({ message: 'Failed to update restock request' }); // 500 Internal Server Error — update failed
    }
  }
}
