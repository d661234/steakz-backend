import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@steakz.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  const defaultPassword = process.env.DEFAULT_PASSWORD || 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password_hash: hashedPassword,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
    },
    create: {
      email: adminEmail,
      password_hash: hashedPassword,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  const branch = await prisma.branch.upsert({
    where: { name: 'Main Branch' },
    update: {},
    create: {
      name: 'Main Branch',
      location_address: '123 Steakhouse Ave, Meat City',
    },
  });

  const hqManager = await prisma.user.upsert({
    where: { email: 'hq@steakz.com' },
    update: {
      password_hash: hashedPassword,
      role: UserRole.HQ_MANAGER,
      firstName: 'HQ',
      lastName: 'Manager',
    },
    create: {
      email: 'hq@steakz.com',
      password_hash: hashedPassword,
      role: UserRole.HQ_MANAGER,
      firstName: 'HQ',
      lastName: 'Manager',
    },
  });

  const branchManager = await prisma.user.upsert({
    where: { email: 'branch_manager@steakz.com' },
    update: {
      password_hash: hashedPassword,
      role: UserRole.BRANCH_MANAGER,
      branch_id: branch.id,
      firstName: 'Branch',
      lastName: 'Manager',
    },
    create: {
      email: 'branch_manager@steakz.com',
      password_hash: hashedPassword,
      role: UserRole.BRANCH_MANAGER,
      branch_id: branch.id,
      firstName: 'Branch',
      lastName: 'Manager',
    },
  });

  const waiter = await prisma.user.upsert({
    where: { email: 'waiter@steakz.com' },
    update: {
      password_hash: hashedPassword,
      role: UserRole.WAITER,
      branch_id: branch.id,
      firstName: 'Waiter',
      lastName: 'User',
    },
    create: {
      email: 'waiter@steakz.com',
      password_hash: hashedPassword,
      role: UserRole.WAITER,
      branch_id: branch.id,
      firstName: 'Waiter',
      lastName: 'User',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@steakz.com' },
    update: {
      password_hash: hashedPassword,
      role: UserRole.CUSTOMER,
      firstName: 'Customer',
      lastName: 'User',
    },
    create: {
      email: 'customer@steakz.com',
      password_hash: hashedPassword,
      role: UserRole.CUSTOMER,
      firstName: 'Customer',
      lastName: 'User',
    },
  });

  const openAccess = await prisma.user.upsert({
    where: { email: 'open_access@steakz.com' },
    update: {
      password_hash: hashedPassword,
      role: UserRole.OPEN_ACCESS,
      firstName: 'Open',
      lastName: 'Access',
    },
    create: {
      email: 'open_access@steakz.com',
      password_hash: hashedPassword,
      role: UserRole.OPEN_ACCESS,
      firstName: 'Open',
      lastName: 'Access',
    },
  });

  console.log({ admin, hqManager, branchManager, waiter, customer, openAccess, branch });

  console.log({ branch });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
