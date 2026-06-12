import prisma from '../lib/prisma.js'; // Import the shared Prisma client singleton for all database operations
import { Prisma } from '@prisma/client'; // Import Prisma namespace for typed create and update input types

export class MenuService { // Service class encapsulating all menu item database operations
  static async getMenuByBranch(branchId: number) { // Returns all menu items belonging to a specific branch
    return prisma.menuItem.findMany({ // Fetch menu items matching the branch filter
      where: { branch_id: branchId }, // Filter by the provided branch ID
    });
  }

  static async getMenuItemById(id: number) { // Returns a single menu item by its database ID
    return prisma.menuItem.findUnique({ // Find exactly one menu item by primary key
      where: { id }, // Match the item by its integer ID
    });
  }

  static async createMenuItem(data: Prisma.MenuItemUncheckedCreateInput) { // Creates a new menu item using unchecked input (allows setting branch_id directly)
    return prisma.menuItem.create({ // Persist the new menu item record to the database
      data, // Pass through all fields provided by the caller
    });
  }

  static async updateMenuItem(id: number, data: Prisma.MenuItemUpdateInput) { // Updates an existing menu item's fields by ID
    return prisma.menuItem.update({ // Perform the update on the matching menu item
      where: { id }, // Target the item by its integer ID
      data, // Apply the provided field changes
    });
  }

  static async deleteMenuItem(id: number) { // Deletes a menu item and removes it from all orders, within a transaction
    return prisma.$transaction(async (tx) => { // Wrap in a transaction so both operations succeed or both roll back
      // Remove order items referencing this menu item before deleting it
      await tx.orderItem.deleteMany({ where: { menuItemId: id } }); // Delete all order items that reference this menu item to avoid FK constraint violations
      return tx.menuItem.delete({ where: { id } }); // Delete the menu item itself now that references are cleared
    });
  }
}
