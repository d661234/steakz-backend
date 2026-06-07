import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

export class MenuService {
  static async getMenuByBranch(branchId: string) {
    return prisma.menuItem.findMany({
      where: { branch_id: branchId },
    });
  }

  static async getMenuItemById(id: string) {
    return prisma.menuItem.findUnique({
      where: { id },
    });
  }

  static async createMenuItem(data: Prisma.MenuItemUncheckedCreateInput) {
    return prisma.menuItem.create({
      data,
    });
  }

  static async updateMenuItem(id: string, data: Prisma.MenuItemUpdateInput) {
    return prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  static async deleteMenuItem(id: string) {
    return prisma.menuItem.delete({
      where: { id },
    });
  }
}
