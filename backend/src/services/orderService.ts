import prisma from '../lib/prisma.js'; // Import the shared Prisma client singleton for all database operations
import { OrderStatus, Prisma } from '@prisma/client'; // Import OrderStatus enum for type-safe status updates and Prisma namespace for typed inputs

export class OrderService { // Service class encapsulating all order-related database operations
  static async getAllOrders(where?: Prisma.OrderWhereInput) { // Returns all orders, optionally filtered by a Prisma where clause (e.g. branch_id)
    return prisma.order.findMany({ // Fetch orders matching the optional filter
      where, // Apply the caller-provided filter (e.g. { branch_id: 1 }); undefined means no filter
      include: {
        branch: true, // Include the branch the order was placed at
        user: true, // Include the customer who placed the order (if any)
        items: {
          include: {
            menuItem: true, // Include full menu item details for each order item line
          },
        },
      },
      orderBy: { orderDate: 'desc' } // Return most recent orders first
    });
  }

  static async getOrderById(id: number) { // Returns a single order with all related data by its database ID
    return prisma.order.findUnique({ // Find exactly one order by primary key
      where: { id }, // Match the order by its integer ID
      include: {
        branch: true, // Include the branch the order belongs to
        user: true, // Include the customer who placed the order
        items: {
          include: {
            menuItem: true, // Include full menu item details for each line item
          },
        },
      },
    });
  }

  static async getUnavailableItems(menuItemIds: number[]): Promise<string[]> { // Returns the names of menu items in the provided IDs that are currently unavailable
    const unavailable = await prisma.menuItem.findMany({ // Fetch items that match the IDs and are marked unavailable
      where: { id: { in: menuItemIds }, availability_status: false }, // Filter for items in the ID list that are sold out
      select: { item_name: true }, // Only fetch the name field to keep the query lightweight
    });
    return unavailable.map(m => m.item_name); // Return an array of unavailable item names for the error message
  }

  static async validateMenuItemsExist(menuItemIds: number[]): Promise<number[]> { // Returns IDs from the provided list that do not exist in the database
    const found = await prisma.menuItem.findMany({ // Fetch only the IDs of items that actually exist
      where: { id: { in: menuItemIds } }, // Look for items whose ID is in the provided list
      select: { id: true }, // Only fetch the ID field to keep the query lightweight
    });
    const foundIds = found.map(m => m.id); // Extract the IDs that were found
    return menuItemIds.filter(id => !foundIds.includes(id)); // Return IDs that were requested but not found — these are missing items
  }

  static async createOrder(data: Prisma.OrderUncheckedCreateInput) { // Creates a new order using unchecked input (allows setting branch_id and customer_id directly)
    return prisma.order.create({ // Persist the order and its nested items in one database call
      data, // Pass through all fields and nested creates provided by the caller
      include: { items: { include: { menuItem: true } }, branch: true }, // Return the created order with its items and branch for the response
    });
  }

  static async updateOrderStatus(id: number, status: OrderStatus) { // Updates the status field of an order by its ID
    return prisma.order.update({ // Perform the status update
      where: { id }, // Target the order by its integer ID
      data: { status }, // Set the new status value
    });
  }

  static async confirmOrderPayment(id: number) { // Sets an order's status to PAID, marking it as fully settled
    return prisma.order.update({ // Perform the status update
      where: { id }, // Target the order by its integer ID
      data: { status: 'PAID' }, // Hard-code the target status to PAID for this specific operation
    });
  }

  static async getOrdersByCustomer(customerId: number) { // Returns all orders placed by a specific customer, most recent first
    return prisma.order.findMany({ // Fetch orders filtered by the customer's ID
      where: { customer_id: customerId }, // Only return orders belonging to this customer
      include: {
        branch: true, // Include the branch the order was placed at
        items: {
          include: {
            menuItem: true, // Include full menu item details for each order line
          },
        },
      },
      orderBy: { orderDate: 'desc' } // Return most recent orders first
    });
  }

  static async deleteOrder(id: number) { // Permanently deletes an order by its ID
    return prisma.order.delete({ // Remove the order record from the database
      where: { id }, // Target the order by its integer ID
    });
  }
}
