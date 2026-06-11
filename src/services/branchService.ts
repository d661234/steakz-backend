import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

export class BranchService {
  static async getAllBranches() {
    return prisma.branch.findMany({
      include: {
        _count: {
          select: { staff: true, menuItems: true, orders: true, inventoryAlerts: true }
        }
      }
    });
  }

  static async getBranchById(id: number) {
    return prisma.branch.findUnique({
      where: { id },
      include: {
        staff: true,
        menuItems: true,
        inventoryAlerts: true
      }
    });
  }

  static async getPublicBranches() {
    return prisma.branch.findMany({
      where: { isActive: true },
      include: {
        menuItems: {
          where: { availability_status: true }
        }
      }
    });
  }

  static async getPublicMenuByBranch(branchId: number) {
    return prisma.menuItem.findMany({
      where: { branch_id: branchId }
    });
  }

  static async createBranch(data: Prisma.BranchCreateInput) {
    return prisma.branch.create({
      data,
    });
  }

  static async updateBranch(id: number, data: Prisma.BranchUpdateInput) {
    return prisma.branch.update({
      where: { id },
      data,
    });
  }

  static async deleteBranch(id: number) {
    return prisma.$transaction(async (tx) => {
      // Remove order items for every order belonging to this branch
      await tx.orderItem.deleteMany({ where: { order: { branch_id: id } } });
      // Remove order items referencing menu items of this branch (cross-branch edge case)
      await tx.orderItem.deleteMany({ where: { menuItem: { branch_id: id } } });
      // Remove orders
      await tx.order.deleteMany({ where: { branch_id: id } });
      // Remove menu items
      await tx.menuItem.deleteMany({ where: { branch_id: id } });
      // Unlink staff (keep the users, just detach them from the branch)
      await tx.user.updateMany({ where: { branch_id: id }, data: { branch_id: null } });
      // Remove inventory alerts and stock requests
      await tx.inventoryAlert.deleteMany({ where: { branch_id: id } });
      await tx.stockRequest.deleteMany({ where: { branch_id: id } });
      // Finally delete the branch itself
      return tx.branch.delete({ where: { id } });
    });
  }
}
