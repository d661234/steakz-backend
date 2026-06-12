import prisma from '../lib/prisma.js'; // Import the shared Prisma client singleton for all database operations
import { Prisma } from '@prisma/client'; // Import Prisma namespace for typed create and update input types

export class BranchService { // Service class encapsulating all branch-related database operations
  static async getAllBranches() { // Returns all branches with aggregate counts for staff, menu items, orders, and alerts
    return prisma.branch.findMany({ // Fetch every branch record
      include: {
        _count: {
          select: { staff: true, menuItems: true, orders: true, inventoryAlerts: true } // Include counts of related records instead of full arrays to keep the response lightweight
        }
      }
    });
  }

  static async getBranchById(id: number) { // Returns a single branch with its full staff, menu items, and alerts arrays
    return prisma.branch.findUnique({ // Find exactly one branch by primary key
      where: { id }, // Match the branch by its integer ID
      include: {
        staff: true, // Include the full list of staff users assigned to this branch
        menuItems: true, // Include all menu items belonging to this branch
        inventoryAlerts: true // Include all inventory alerts associated with this branch
      }
    });
  }

  static async getPublicBranches() { // Returns only active branches with their currently available menu items (for unauthenticated users)
    return prisma.branch.findMany({ // Fetch branches matching the active filter
      where: { isActive: true }, // Only return branches that are currently open/active
      include: {
        menuItems: {
          where: { availability_status: true } // Only include menu items that are currently available (not sold out)
        }
      }
    });
  }

  static async getPublicMenuByBranch(branchId: number) { // Returns all menu items for a specific branch (public endpoint, no availability filter)
    return prisma.menuItem.findMany({ // Fetch menu items for the given branch
      where: { branch_id: branchId } // Filter by branch ID
    });
  }

  static async createBranch(data: Prisma.BranchCreateInput) { // Creates a new branch with the provided data
    return prisma.branch.create({ // Persist the new branch record to the database
      data, // Pass through all fields provided by the caller
    });
  }

  static async updateBranch(id: number, data: Prisma.BranchUpdateInput) { // Updates an existing branch's fields by ID
    return prisma.branch.update({ // Perform the update on the matching branch
      where: { id }, // Target the branch by its integer ID
      data, // Apply the provided field changes
    });
  }

  static async deleteBranch(id: number) { // Deletes a branch and all its associated data within a single transaction
    return prisma.$transaction(async (tx) => { // Wrap all deletions in a transaction so they all succeed or all roll back
      // Remove order items for every order belonging to this branch
      await tx.orderItem.deleteMany({ where: { order: { branch_id: id } } }); // Delete order items via their parent order's branch_id relation
      // Remove order items referencing menu items of this branch (cross-branch edge case)
      await tx.orderItem.deleteMany({ where: { menuItem: { branch_id: id } } }); // Delete order items that reference this branch's menu items even if the order belongs to another branch
      // Remove orders
      await tx.order.deleteMany({ where: { branch_id: id } }); // Delete all orders placed at this branch
      // Remove menu items
      await tx.menuItem.deleteMany({ where: { branch_id: id } }); // Delete all menu items belonging to this branch
      // Unlink staff (keep the users, just detach them from the branch)
      await tx.user.updateMany({ where: { branch_id: id }, data: { branch_id: null } }); // Detach staff from the branch without deleting their accounts
      // Remove inventory alerts and stock requests
      await tx.inventoryAlert.deleteMany({ where: { branch_id: id } }); // Delete all inventory alerts for this branch
      await tx.stockRequest.deleteMany({ where: { branch_id: id } }); // Delete all stock requests from this branch
      // Finally delete the branch itself
      return tx.branch.delete({ where: { id } }); // Delete the branch record now that all dependent records are gone
    });
  }
}
