import prisma from '../lib/prisma.js';
import { Prisma, UserRole } from '@prisma/client';

export class UserService {
  static async getAllUsers() {
    return prisma.user.findMany({
      include: {
        branch: true,
      },
    });
  }

  static async getStaffMembers() {
    return prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.HQ_MANAGER, UserRole.BRANCH_MANAGER, UserRole.WAITER],
        },
      },
      include: {
        branch: true,
      },
    });
  }

  static async getUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        branch: true,
      },
    });
  }

  static async getFavouriteItems(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        favouriteItems: true,
      },
    });

    return user?.favouriteItems ?? [];
  }

  static async addFavouriteItem(userId: number, itemId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        favouriteItems: {
          connect: { id: itemId },
        },
      },
      include: {
        favouriteItems: true,
      },
    });
  }

  static async removeFavouriteItem(userId: number, itemId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        favouriteItems: {
          disconnect: { id: itemId },
        },
      },
      include: {
        favouriteItems: true,
      },
    });
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async assignStaffToBranch(staffId: number, branchId: number) {
    return prisma.user.update({
      where: { id: staffId },
      data: {
        branch_id: branchId,
      },
      include: {
        branch: true,
      },
    });
  }

  static async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  static async updateUser(id: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { branch: true },
    });
  }

  static async deleteUser(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }
}
