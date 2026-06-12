import { PrismaClient, UserRole } from '@prisma/client'; // Import Prisma client and UserRole enum for database access and role type safety

const prisma = new PrismaClient(); // Create a local Prisma client instance (separate from the singleton — works fine for service-level use)

export class RoleService { // Service class handling role management and audit logging operations
  static async changeUserRole(adminId: number, userId: number, newRole: UserRole) { // Changes a user's role and writes an audit log entry; only admins can invoke this
    const admin = await prisma.user.findUnique({ where: { id: adminId } }); // Fetch the requesting admin to verify their role server-side

    if (!admin || admin.role !== UserRole.ADMIN) { // Guard: only ADMIN-role users may change roles, even if RBAC middleware passed
      throw new Error('Only admins can change user roles'); // Throw to prevent role escalation if middleware is misconfigured
    }

    const user = await prisma.user.findUnique({ where: { id: userId } }); // Fetch the target user to capture their current role for the audit log

    if (!user) { // Target user does not exist in the database
      throw new Error('User not found'); // Throw before attempting any update
    }

    await prisma.roleChangeAudit.create({ // Write an immutable audit log entry recording who changed whose role and when
      data: {
        userId, // The ID of the user whose role is being changed
        previousRole: user.role, // The role they had before the change (for audit history)
        newRole, // The new role being assigned
        changedBy: adminId, // The ID of the admin who authorised the change
      },
    });

    return prisma.user.update({ // Apply the actual role change to the user record
      where: { id: userId }, // Target the user by their integer ID
      data: { role: newRole }, // Set the new role value
    });
  }

  static async deactivateUser(adminId: number, userId: number) { // Sets a user's isActive flag to false; only admins can invoke this
    const admin = await prisma.user.findUnique({ where: { id: adminId } }); // Fetch the requesting admin to verify their role server-side

    if (!admin || admin.role !== UserRole.ADMIN) { // Guard: only ADMIN-role users may deactivate accounts
      throw new Error('Only admins can deactivate users'); // Throw to prevent unauthorised deactivation
    }

    return prisma.user.update({ // Update the user's isActive flag to false
      where: { id: userId }, // Target the user by their integer ID
      data: { isActive: false }, // Deactivate the account (prevents login without deleting data)
    });
  }

  static async getUserActivitySummary() { // Returns counts of total users, active users, and a breakdown by role
    const totalUsers = await prisma.user.count(); // Count all user records regardless of role or active status
    const activeUsers = await prisma.user.count({ where: { isActive: true } }); // Count only users whose account is currently active
    const usersByRole = await prisma.user.groupBy({ // Group users by role and count each group
      by: ['role'], // Group on the role field
      _count: { id: true }, // Count the number of users in each role group
    });

    return { totalUsers, activeUsers, usersByRole }; // Return the summary object with all three metrics
  }

  static async getRoleChangeAudit() { // Returns all role change audit log entries, most recent first
    return prisma.roleChangeAudit.findMany({ // Fetch all audit records
      orderBy: { changedAt: 'desc' }, // Sort by change timestamp descending — most recent first
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true }, // Include minimal user info to identify who was changed without exposing passwords
        },
      },
    });
  }
}
