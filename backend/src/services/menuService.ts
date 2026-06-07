import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

export class MenuService {
  static async getMenuByBranch(branchId: string) {
    return prisma.menu.findMany({
      where: { branch_id: branchId },
    });
  }

  static async getMenuItemById(id: string) {
    return prisma.menu.findUnique({
      where: { id },
    });
  }

  static async createMenuItem(data: Prisma.MenuUncheckedCreateInput) {
    return prisma.menu.create({
      data,
    });
  }

  static async updateMenuItem(id: string, data: Prisma.MenuUpdateInput) {
    return prisma.menu.update({
      where: { id },
      data,
    });
  }

  static async deleteMenuItem(id: string) {
    return prisma.menu.delete({
      where: { id },
    });
  }
}
