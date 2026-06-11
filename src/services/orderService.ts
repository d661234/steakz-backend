import prisma from '../lib/prisma.js';
import { OrderStatus, Prisma } from '@prisma/client';

export class OrderService {
  static async getAllOrders(where?: Prisma.OrderWhereInput) {
    return prisma.order.findMany({
      where,
      include: {
        branch: true,
        user: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { orderDate: 'desc' }
    });
  }

  static async getOrderById(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        branch: true,
        user: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  static async getUnavailableItems(menuItemIds: number[]): Promise<string[]> {
    const unavailable = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, availability_status: false },
      select: { item_name: true },
    });
    return unavailable.map(m => m.item_name);
  }

  static async validateMenuItemsExist(menuItemIds: number[]): Promise<number[]> {
    const found = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      select: { id: true },
    });
    const foundIds = found.map(m => m.id);
    return menuItemIds.filter(id => !foundIds.includes(id));
  }

  static async createOrder(data: Prisma.OrderUncheckedCreateInput) {
    return prisma.order.create({
      data,
      include: { items: { include: { menuItem: true } }, branch: true },
    });
  }

  static async updateOrderStatus(id: number, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  static async confirmOrderPayment(id: number) {
    return prisma.order.update({
      where: { id },
      data: { status: 'PAID' },
    });
  }

  static async getOrdersByCustomer(customerId: number) {
    return prisma.order.findMany({
      where: { customer_id: customerId },
      include: {
        branch: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { orderDate: 'desc' }
    });
  }

  static async deleteOrder(id: number) {
    return prisma.order.delete({
      where: { id },
    });
  }
}
