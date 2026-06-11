import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RecommendationService {
  static async getRecommendationsBasedOnFavourites(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        favouriteItems: {
          select: { id: true, category: true },
        },
      },
    });

    if (!user || user.favouriteItems.length === 0) {
      return prisma.menuItem.findMany({
        where: { availability_status: true },
        orderBy: { viewCount: 'desc' },
        take: 6,
      });
    }

    const favouriteCategories = [...new Set(
      user.favouriteItems.map(item => item.category).filter((c): c is string => c != null)
    )];

    return prisma.menuItem.findMany({
      where: {
        category: { in: favouriteCategories },
        NOT: { id: { in: user.favouriteItems.map(item => item.id) } },
      },
      take: 5,
      orderBy: { viewCount: 'desc' },
    });
  }

  static async getOneClickReorder(userId: number, orderId: number) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, customer_id: userId },
      include: { items: { include: { menuItem: true } } },
    });

    if (!order) {
      throw new Error('Order not found or does not belong to user');
    }

    return prisma.order.create({
      data: {
        customer_id: userId,
        branch_id: order.branch_id,
        total_amount: order.total_amount,
        isRepeatedOrder: true,
        items: {
          create: order.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }
}
