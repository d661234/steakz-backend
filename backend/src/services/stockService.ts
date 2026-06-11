import prisma from '../lib/prisma.js';
import { StockRequestStatus } from '@prisma/client';

export class StockService {
  static async createRequest(data: {
    branch_id: number;
    requestedBy?: number;
    item_name: string;
    quantity: number;
    unit?: string;
    notes?: string;
  }) {
    return prisma.stockRequest.create({ data, include: { branch: true, user: true } });
  }

  static async getAllRequests(where?: { branch_id?: number; status?: StockRequestStatus }) {
    return prisma.stockRequest.findMany({
      where,
      include: { branch: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateStatus(id: number, status: StockRequestStatus) {
    return prisma.stockRequest.update({
      where: { id },
      data: { status },
      include: { branch: true, user: true },
    });
  }
}
