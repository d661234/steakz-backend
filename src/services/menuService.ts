import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

export class MenuService {
  static async getMenuByBranch(branchId: number) {
    return prisma.menuItem.findMany({
      where: { branch_id: branchId },
    });
  }

  static async getMenuItemById(id: number) {
    return prisma.menuItem.findUnique({
      where: { id },
    });
  }

  static async createMenuItem(data: Prisma.MenuItemUncheckedCreateInput) {
    return prisma.menuItem.create({
      data,
    });
  }

  static async updateMenuItem(id: number, data: Prisma.MenuItemUpdateInput) {
    return prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  static async deleteMenuItem(id: number) {
    return prisma.$transaction(async (tx) => {
      // Remove order items referencing this menu item before deleting it
      await tx.orderItem.deleteMany({ where: { menuItemId: id } });
      return tx.menuItem.delete({ where: { id } });
    });
  }
}
