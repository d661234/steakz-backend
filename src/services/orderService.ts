import prisma from '../lib/prisma.js';
import { OrderStatus, Prisma } from '@prisma/client';

export class OrderService {
  static async getAllOrders(where?: Prisma.OrderWhereInput) {
    return prisma.order.findMany({
      where,
      include: {
        branch: true,
        table: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        branch: true,
        table: true,
        customer: true,
      },
    });
  }

  static async createOrder(data: Prisma.OrderUncheckedCreateInput) {
    return prisma.order.create({
      data,
    });
  }

  static async updateOrderStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  static async getOrdersByCustomer(customerId: string) {
    return prisma.order.findMany({
      where: { customer_id: customerId },
      include: {
        branch: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async deleteOrder(id: string) {
    return prisma.order.delete({
      where: { id },
    });
  }
}
