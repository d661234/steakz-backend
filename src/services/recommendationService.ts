import { PrismaClient } from '@prisma/client'; // Import Prisma client for all database queries in this service

const prisma = new PrismaClient(); // Create a local Prisma client instance for this service

export class RecommendationService { // Service class providing personalised menu recommendations and one-click reorder functionality
  static async getRecommendationsBasedOnFavourites(userId: number) { // Returns menu items recommended based on the categories of the user's saved favourites
    const user = await prisma.user.findUnique({ // Fetch the user along with their saved favourite items
      where: { id: userId }, // Look up by user ID
      include: {
        favouriteItems: {
          select: { id: true, category: true }, // Only fetch the ID and category of each favourite — enough to derive recommendations
        },
      },
    });

    if (!user || user.favouriteItems.length === 0) { // If the user has no favourites, fall back to popular items
      return prisma.menuItem.findMany({ // Return the most viewed available items as a generic recommendation
        where: { availability_status: true }, // Only recommend currently available items
        orderBy: { viewCount: 'desc' }, // Most viewed items first as a popularity proxy
        take: 6, // Return up to 6 popular items as the fallback set
      });
    }

    const favouriteCategories = [...new Set( // Derive unique categories from the user's favourites
      user.favouriteItems.map(item => item.category).filter((c): c is string => c != null) // Map to categories and filter out null/undefined values with a type guard
    )];

    return prisma.menuItem.findMany({ // Fetch items in the same categories as the user's favourites, excluding what they already saved
      where: {
        category: { in: favouriteCategories }, // Match items whose category is one the user already likes
        NOT: { id: { in: user.favouriteItems.map(item => item.id) } }, // Exclude items the user already has in their favourites
      },
      take: 5, // Limit to 5 recommendations
      orderBy: { viewCount: 'desc' }, // Surface the most popular items within matching categories first
    });
  }

  static async getOneClickReorder(userId: number, orderId: number) { // Creates a new order that duplicates the items from a past order
    const order = await prisma.order.findFirst({ // Fetch the original order, verifying it belongs to the requesting user
      where: { id: orderId, customer_id: userId }, // Scope to both the order ID and the user ID to prevent reordering another user's order
      include: { items: { include: { menuItem: true } } }, // Include order items and their menu item details for the duplication
    });

    if (!order) { // Order not found or does not belong to this user
      throw new Error('Order not found or does not belong to user'); // Throw to prevent reordering someone else's order
    }

    return prisma.order.create({ // Create a new order with the same items as the original
      data: {
        customer_id: userId, // Assign the new order to the same customer
        branch_id: order.branch_id, // Place the reorder at the same branch as the original
        total_amount: order.total_amount, // Copy the total amount from the original order
        isRepeatedOrder: true, // Flag this as a reorder so analytics can distinguish it from new orders
        items: {
          create: order.items.map(item => ({ // Recreate each line item from the original order
            menuItemId: item.menuItemId, // Reference the same menu item
            quantity: item.quantity, // Use the same quantity as the original
            price: item.price, // Use the price from the original order (price at time of original order)
          })),
        },
      },
    });
  }
}
