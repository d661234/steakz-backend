import prisma from '../lib/prisma.js'; // Import the shared Prisma client singleton for all database operations
import { StockRequestStatus } from '@prisma/client'; // Import the StockRequestStatus enum for type-safe status updates

export class StockService { // Service class encapsulating all stock request database operations
  static async createRequest(data: { // Creates a new stock/restock request for a branch
    branch_id: number; // The ID of the branch submitting the request
    requestedBy?: number; // The user ID of the staff member who created the request (optional for audit purposes)
    item_name: string; // The name of the item to be restocked
    quantity: number; // How many units are needed
    unit?: string; // The unit of measurement (e.g. kg, litres, units)
    notes?: string; // Optional additional notes from the branch manager
  }) {
    return prisma.stockRequest.create({ data, include: { branch: true, user: true } }); // Persist the request and return it with the related branch and requesting user
  }

  static async getAllRequests(where?: { branch_id?: number; status?: StockRequestStatus }) { // Returns stock requests filtered by optional branch and/or status criteria
    return prisma.stockRequest.findMany({ // Fetch requests matching the optional filter
      where, // Apply the caller-provided filter (undefined means no filter — returns all)
      include: { branch: true, user: true }, // Include branch and requesting user for context in the response
      orderBy: { createdAt: 'desc' }, // Return most recent requests first
    });
  }

  static async updateStatus(id: number, status: StockRequestStatus) { // Updates the workflow status of a stock request (e.g. PENDING → ACKNOWLEDGED → ORDERED → FULFILLED)
    return prisma.stockRequest.update({ // Perform the status update
      where: { id }, // Target the stock request by its integer ID
      data: { status }, // Set the new status value
      include: { branch: true, user: true }, // Return the updated request with branch and user context
    });
  }
}
