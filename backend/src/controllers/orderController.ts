import { Request, Response } from 'express'; // Import Express types for request and response objects
import { UserRole } from '@prisma/client'; // Import UserRole enum to check if the requester is a CUSTOMER when confirming payment
import { OrderService } from '../services/orderService.js'; // Import OrderService for all order database operations
import { AuthRequest } from '../middleware/auth.js'; // Import the extended request type carrying the authenticated user payload

const id = (p: string | string[]) => parseInt(p as string); // Helper converting a URL route parameter string to an integer

export class OrderController { // Controller class grouping all order-related request handlers
  static async getAllOrders(req: AuthRequest, res: Response) { // Handles GET /api/orders — returns orders, scoped to the user's branch if applicable
    try {
      const where = req.user?.branch_id ? { branch_id: req.user.branch_id } : {}; // Build a filter: branch-scoped users only see their branch's orders; admins/HQ see all
      const orders = await OrderService.getAllOrders(where); // Fetch orders with the optional branch filter applied
      res.status(200).json(orders); // 200 OK — return the orders array
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' }); // 500 Internal Server Error — query failed
    }
  }

  static async getOrderById(req: AuthRequest, res: Response) { // Handles GET /api/orders/:id — returns a single order by ID
    try {
      const order = await OrderService.getOrderById(id(req.params.id)); // Fetch the full order including branch, user, and items
      if (!order) return res.status(404).json({ message: 'Order not found' }); // 404 Not Found — no order with that ID

      if (req.user?.branch_id && order.branch_id !== req.user.branch_id) { // Branch-scoped users must not access orders from other branches
        return res.status(403).json({ message: 'Forbidden: Order belongs to another branch' }); // 403 Forbidden — order is outside the user's branch
      }

      res.status(200).json(order); // 200 OK — return the order detail object
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch order' }); // 500 Internal Server Error — query failed
    }
  }

  static async createOrder(req: AuthRequest, res: Response) { // Handles POST /api/orders — creates a new order for authenticated users
    try {
      const { branch_id, total_amount, items } = req.body; // Destructure top-level order fields from the request body

      // Accept items as a plain array OR already in Prisma's { create: [] } shape
      const itemsArray: Array<{ menuItemId: number; quantity: number; price: number }> = // Normalise items to a flat array regardless of input shape
        Array.isArray(items) ? items : (items?.create ?? []); // If items is already an array use it; if it's a Prisma shape extract the create array; else default to empty

      const itemIds = itemsArray.map((i) => Number(i.menuItemId)); // Extract all menu item IDs from the order items for validation
      if (itemIds.length > 0) { // Only validate if there are items in the order
        const missing = await OrderService.validateMenuItemsExist(itemIds); // Check which item IDs don't exist in the database
        if (missing.length > 0) { // Some items were not found
          return res.status(400).json({ message: `Menu item(s) not found: ${missing.join(', ')}` }); // 400 Bad Request — cannot order non-existent items
        }
        const soldOut = await OrderService.getUnavailableItems(itemIds); // Check which existing items are currently unavailable
        if (soldOut.length > 0) { // Some items are sold out
          return res.status(400).json({ message: `The following items are sold out: ${soldOut.join(', ')}` }); // 400 Bad Request — cannot order sold-out items
        }
      }

      const order = await OrderService.createOrder({ // Persist the new order via OrderService
        branch_id: Number(branch_id), // Coerce branch_id to number in case it arrived as a string
        total_amount: Number(total_amount), // Coerce total_amount to number in case it arrived as a string
        customer_id: req.user?.role === 'CUSTOMER' ? req.user.id : (req.body.customer_id ? Number(req.body.customer_id) : undefined), // Use the authenticated customer's ID, or allow an explicit customer_id for waiter/admin placing on behalf of a customer
        items: {
          create: itemsArray.map((i) => ({ // Map each item to the Prisma nested create shape
            menuItemId: Number(i.menuItemId), // Coerce menu item ID to number
            quantity: Number(i.quantity), // Coerce quantity to number
            price: Number(i.price), // Coerce price to number
          })),
        },
      });
      res.status(201).json(order); // 201 Created — return the newly created order
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create order'; // Extract error message safely
      res.status(500).json({ message }); // 500 Internal Server Error — order creation failed
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) { // Handles PATCH /api/orders/:id/status — changes the status of an order
    try {
      const { status } = req.body; // Extract the new status value from the request body
      const order = await OrderService.updateOrderStatus(id(req.params.id), status); // Update the order's status field in the database
      res.status(200).json(order); // 200 OK — return the updated order
    } catch (error) {
      res.status(500).json({ message: 'Failed to update order status' }); // 500 Internal Server Error — status update failed
    }
  }

  static async createGuestOrder(req: Request, res: Response) { // Handles POST /api/orders/guest — creates an order for unauthenticated guests
    try {
      const { branch_id, total_amount, items } = req.body; // Destructure order fields; no customer_id expected for guests
      if (!branch_id || !total_amount) { // Validate the minimum required fields
        return res.status(400).json({ message: 'branch_id and total_amount are required' }); // 400 Bad Request — cannot create order without these
      }

      // Accept items as a plain array OR already in Prisma's { create: [] } shape
      const itemsArray: Array<{ menuItemId: number; quantity: number; price: number }> = // Normalise items to a flat array regardless of input shape
        Array.isArray(items) ? items : (items?.create ?? []); // Same normalisation logic as createOrder

      const itemIds = itemsArray.map((i) => Number(i.menuItemId)); // Extract item IDs for validation
      if (itemIds.length > 0) { // Only validate if items were provided
        const missing = await OrderService.validateMenuItemsExist(itemIds); // Check all item IDs exist
        if (missing.length > 0) { // Some items not found
          return res.status(400).json({ message: `Menu item(s) not found: ${missing.join(', ')}` }); // 400 Bad Request — unknown menu items
        }
        const soldOut = await OrderService.getUnavailableItems(itemIds); // Check items are available
        if (soldOut.length > 0) { // Some items sold out
          return res.status(400).json({ message: `The following items are sold out: ${soldOut.join(', ')}` }); // 400 Bad Request — sold-out items
        }
      }

      const order = await OrderService.createOrder({ // Persist the guest order — no customer_id field
        branch_id: Number(branch_id), // Coerce branch_id to number
        total_amount: Number(total_amount), // Coerce total_amount to number
        items: {
          create: itemsArray.map((i) => ({ // Map each item to the Prisma nested create shape
            menuItemId: Number(i.menuItemId), // Coerce menu item ID to number
            quantity: Number(i.quantity), // Coerce quantity to number
            price: Number(i.price), // Coerce price to number
          })),
        },
      });
      res.status(201).json(order); // 201 Created — return the newly created guest order
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create guest order'; // Extract error message safely
      res.status(500).json({ message }); // 500 Internal Server Error — guest order creation failed
    }
  }

  static async confirmPayment(req: AuthRequest, res: Response) { // Handles PATCH /api/orders/:id/confirm — marks an order as PAID
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); // Guard against missing user — should not happen after JWT middleware

      const order = await OrderService.getOrderById(id(req.params.id)); // Fetch the order to verify it exists and check ownership
      if (!order) return res.status(404).json({ message: 'Order not found' }); // 404 Not Found — no order with that ID

      if (req.user.role === UserRole.CUSTOMER && order.customer_id !== req.user.id) { // Customers can only confirm payment for their own orders
        return res.status(403).json({ message: 'Forbidden: Order does not belong to customer' }); // 403 Forbidden — customer tried to pay for someone else's order
      }

      const updatedOrder = await OrderService.confirmOrderPayment(id(req.params.id)); // Set the order status to PAID
      res.status(200).json(updatedOrder); // 200 OK — return the updated order
    } catch (error) {
      res.status(500).json({ message: 'Failed to confirm payment' }); // 500 Internal Server Error — payment confirmation failed
    }
  }
}
