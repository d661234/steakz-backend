import { Response } from 'express'; // Import Express Response type for handler return types
import prisma from '../lib/prisma.js'; // Import the shared Prisma client singleton for direct DB queries
import { UserService } from '../services/userService.js'; // Import UserService for profile and favourites operations
import { OrderService } from '../services/orderService.js'; // Import OrderService for fetching order history
import { RecommendationService } from '../services/recommendationService.js'; // Import RecommendationService for recommendations and reorder
import { AuthRequest } from '../middleware/auth.js'; // Import the extended request type carrying the authenticated user payload

const id = (p: string | string[]) => parseInt(p as string); // Helper converting a URL route parameter string to an integer

export class CustomerController { // Controller class grouping all customer-facing request handlers
  static async getProfile(req: AuthRequest, res: Response) { // Handles GET /api/customer/profile — returns the authenticated customer's profile
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); // Guard against missing user — should not happen after JWT middleware
      const user = await UserService.getUserById(req.user.id); // Fetch the full user record including branch association
      res.status(200).json(user); // 200 OK — return the user profile object
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch profile' }); // 500 Internal Server Error — database query failed
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) { // Handles PUT /api/customer/profile — updates the authenticated customer's profile
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); // Guard against missing user
      const user = await UserService.updateUser(req.user.id, req.body); // Update the user record with fields from the request body
      res.status(200).json(user); // 200 OK — return the updated user profile
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile' }); // 500 Internal Server Error — update failed
    }
  }

  static async getOrderHistory(req: AuthRequest, res: Response) { // Handles GET /api/customer/orders — returns orders for the current user
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); // Guard against missing user
      // Admin sees all orders; customers see only their own
      const orders = req.user.role === 'ADMIN' // Check if the requester is an admin
        ? await OrderService.getAllOrders() // Admins fetch all orders across all branches
        : await OrderService.getOrdersByCustomer(req.user.id); // Customers fetch only their own orders
      res.status(200).json(orders); // 200 OK — return the orders array
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch order history' }); // 500 Internal Server Error — query failed
    }
  }

  static async getFavourites(req: AuthRequest, res: Response) { // Handles GET /api/customer/favourites — returns the customer's favourite menu items
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); // Guard against missing user
      const favourites = await UserService.getFavouriteItems(req.user.id); // Fetch the list of menu items the user has favourited
      res.status(200).json(favourites); // 200 OK — return the favourites array
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch favourites' }); // 500 Internal Server Error — query failed
    }
  }

  static async toggleFavourite(req: AuthRequest, res: Response) { // Handles POST /api/customer/favourites/:itemId — adds or removes a favourite
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); // Guard against missing user

      const itemId = id(req.params.itemId); // Parse the menu item ID from the URL parameter

      const menuItem = await prisma.menuItem.findUnique({ where: { id: itemId } }); // Verify the menu item actually exists in the database
      if (!menuItem) { // Item not found in DB
        return res.status(404).json({ message: 'Menu item not found' }); // 404 Not Found — cannot favourite a non-existent item
      }

      const favourites = await UserService.getFavouriteItems(req.user.id); // Fetch current favourites to determine if this item is already saved
      const alreadyFavourite = favourites.some(item => item.id === itemId); // Check if the item is already in the user's favourites list

      const updatedUser = alreadyFavourite // Toggle based on current state
        ? await UserService.removeFavouriteItem(req.user.id, itemId) // Item is already a favourite — remove it
        : await UserService.addFavouriteItem(req.user.id, itemId); // Item is not yet a favourite — add it

      res.status(200).json(updatedUser.favouriteItems); // 200 OK — return the updated favourites list
    } catch (error) {
      res.status(500).json({ message: 'Failed to toggle favourite item' }); // 500 Internal Server Error — toggle failed
    }
  }

  static async getRecommendations(req: AuthRequest, res: Response) { // Handles GET /api/customer/recommendations — returns personalised menu suggestions
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); // Guard against missing user
      const recommendations = await RecommendationService.getRecommendationsBasedOnFavourites(req.user.id); // Generate recommendations based on the categories of the user's favourites
      res.status(200).json(recommendations); // 200 OK — return the recommendations array
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recommendations' }); // 500 Internal Server Error — recommendation query failed
    }
  }

  static async reorder(req: AuthRequest, res: Response) { // Handles POST /api/customer/orders/:orderId/reorder — duplicates a past order
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); // Guard against missing user
      const orderId = id(req.params.orderId); // Parse the original order ID from the URL parameter
      const order = await RecommendationService.getOneClickReorder(req.user.id, orderId); // Create a new order with the same items as the referenced past order
      res.status(201).json(order); // 201 Created — return the newly created duplicate order
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reorder'; // Extract error message safely
      res.status(500).json({ message }); // 500 Internal Server Error — reorder failed
    }
  }
}
