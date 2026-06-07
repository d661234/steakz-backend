import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RecommendationService {
  async getRecommendationsBasedOnFavourites(userId: string) {
    // Find user's favourite items
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        favouriteItems: {
          select: { 
            category: true, 
            name: true 
          }
        }
      }
    });

    if (!user || user.favouriteItems.length === 0) {
      return [];
    }

    // Get categories of favourite items
    const favouriteCategories = [...new Set(
      user.favouriteItems.map(item => item.category)
    )];

    // Find similar items in those categories
    const recommendations = await prisma.menuItem.findMany({
      where: {
        category: { in: favouriteCategories },
        NOT: {
          id: { in: user.favouriteItems.map(item => item.id) }
        }
      },
      take: 5,
      orderBy: { viewCount: 'desc' }
    });

    return recommendations;
  }

  async getOneClickReorder(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { 
        id: orderId, 
        userId 
      },
      include: { 
        items: { 
          include: { menuItem: true } 
        } 
      }
    });

    if (!order) {
      throw new Error('Order not found or does not belong to user');
    }

    // Create a new order with the same items
    const newOrder = await prisma.order.create({
      data: {
        userId,
        branchId: order.branchId,
        totalPrice: order.totalPrice,
        isRepeatedOrder: true,
        items: {
          create: order.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    return newOrder;
  }
}