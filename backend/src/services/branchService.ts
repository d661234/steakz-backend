import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

export class BranchService {
  static async getAllBranches() {
    return prisma.branch.findMany({
      include: {
        _count: {
          select: { users: true, menus: true, tables: true, orders: true }
        }
      }
    });
  }

  static async getBranchById(id: string) {
    return prisma.branch.findUnique({
      where: { id },
      include: {
        users: true,
        menus: true,
        tables: true
      }
    });
  }

  static async createBranch(data: Prisma.BranchCreateInput) {
    return prisma.branch.create({
      data,
    });
  }

  static async updateBranch(id: string, data: Prisma.BranchUpdateInput) {
    return prisma.branch.update({
      where: { id },
      data,
    });
  }

  static async deleteBranch(id: string) {
    return prisma.branch.delete({
      where: { id },
    });
  }
}
