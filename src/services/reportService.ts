import prisma from '../lib/prisma.js';

export class ReportService {
  static async getSalesReportPerBranch() {
    const report = await prisma.order.groupBy({
      by: ['branch_id'],
      _sum: {
        total_amount: true,
      },
      _count: {
        id: true,
      },
      where: {
        status: 'PAID'
      }
    });

    // Enriches report with branch names
    const branches = await prisma.branch.findMany({
      select: { id: true, name: true }
    });

    return report.map(item => {
      const branch = branches.find(b => b.id === item.branch_id);
      return {
        branchName: branch ? branch.name : 'Unknown',
        totalSales: item._sum.total_amount || 0,
        orderCount: item._count.id
      };
    });
  }

  static async getBranchPerformance() {
    const report = await prisma.order.groupBy({
      by: ['branch_id'],
      _sum: {
        total_amount: true,
      },
      _count: {
        id: true,
      },
      where: {
        status: 'PAID'
      }
    });

    const branches = await prisma.branch.findMany({
      select: { id: true, name: true }
    });

    return report.map(item => {
      const branch = branches.find(b => b.id === item.branch_id);
      const totalSales = item._sum.total_amount || 0;
      const orderCount = item._count.id;
      return {
        branchName: branch ? branch.name : 'Unknown',
        totalSales,
        orderCount,
        averageOrderValue: orderCount > 0 ? totalSales / orderCount : 0
      };
    });
  }

  static async getGlobalStats() {
    const totalSales = await prisma.order.aggregate({
      _sum: {
        total_amount: true
      },
      where: {
        status: 'PAID'
      }
    });

    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' }
    });
    const totalBranches = await prisma.branch.count();

    return {
      totalSales: totalSales._sum.total_amount || 0,
      totalOrders,
      totalCustomers,
      totalBranches
    };
  }
}
