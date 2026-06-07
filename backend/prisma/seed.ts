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

  const uptownBranch = await prisma.branch.upsert({
    where: { name: 'Uptown Branch' },
    update: {},
    create: {
      name: 'Uptown Branch',
      location_address: '456 Grill Street, Steak City',
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

  const repeatCustomer = await prisma.user.upsert({
    where: { email: 'repeat_customer@steakz.com' },
    update: {
      password_hash: hashedPassword,
      role: UserRole.CUSTOMER,
      firstName: 'Repeat',
      lastName: 'Customer',
    },
    create: {
      email: 'repeat_customer@steakz.com',
      password_hash: hashedPassword,
      role: UserRole.CUSTOMER,
      firstName: 'Repeat',
      lastName: 'Customer',
    },
  });

  const menuItem1 = await prisma.menuItem.upsert({
    where: { id: 'menu1' },
    update: {
      item_name: 'Grilled Ribeye',
      price: 35.99,
      description: 'Juicy ribeye steak with garlic butter',
      category: 'Main Course',
      availability_status: true,
      viewCount: 125,
      branch_id: branch.id,
    },
    create: {
      id: 'menu1',
      item_name: 'Grilled Ribeye',
      description: 'Juicy ribeye steak with garlic butter',
      price: 35.99,
      category: 'Main Course',
      availability_status: true,
      viewCount: 125,
      branch_id: branch.id,
    },
  });

  const menuItem2 = await prisma.menuItem.upsert({
    where: { id: 'menu2' },
    update: {
      item_name: 'Classic Cheeseburger',
      price: 18.5,
      description: 'Beef burger with cheese, lettuce, and tomato',
      category: 'Main Course',
      availability_status: true,
      viewCount: 98,
      branch_id: branch.id,
    },
    create: {
      id: 'menu2',
      item_name: 'Classic Cheeseburger',
      description: 'Beef burger with cheese, lettuce, and tomato',
      price: 18.5,
      category: 'Main Course',
      availability_status: true,
      viewCount: 98,
      branch_id: branch.id,
    },
  });

  const menuItem3 = await prisma.menuItem.upsert({
    where: { id: 'menu3' },
    update: {
      item_name: 'Caesar Salad',
      price: 12.25,
      description: 'Crisp romaine with parmesan and croutons',
      category: 'Appetizer',
      availability_status: true,
      viewCount: 72,
      branch_id: branch.id,
    },
    create: {
      id: 'menu3',
      item_name: 'Caesar Salad',
      description: 'Crisp romaine with parmesan and croutons',
      price: 12.25,
      category: 'Appetizer',
      availability_status: true,
      viewCount: 72,
      branch_id: branch.id,
    },
  });

  const menuItem4 = await prisma.menuItem.upsert({
    where: { id: 'menu4' },
    update: {
      item_name: 'Steak Frites',
      price: 29.0,
      description: 'Sirloin steak with fries and herb butter',
      category: 'Main Course',
      availability_status: true,
      viewCount: 118,
      branch_id: uptownBranch.id,
    },
    create: {
      id: 'menu4',
      item_name: 'Steak Frites',
      description: 'Sirloin steak with fries and herb butter',
      price: 29.0,
      category: 'Main Course',
      availability_status: true,
      viewCount: 118,
      branch_id: uptownBranch.id,
    },
  });

  const menuItem5 = await prisma.menuItem.upsert({
    where: { id: 'menu5' },
    update: {
      item_name: 'Truffle Fries',
      price: 9.99,
      description: 'Crispy fries tossed in truffle oil',
      category: 'Side',
      availability_status: true,
      viewCount: 84,
      branch_id: uptownBranch.id,
    },
    create: {
      id: 'menu5',
      item_name: 'Truffle Fries',
      description: 'Crispy fries tossed in truffle oil',
      price: 9.99,
      category: 'Side',
      availability_status: true,
      viewCount: 84,
      branch_id: uptownBranch.id,
    },
  });

  const menuItem6 = await prisma.menuItem.upsert({
    where: { id: 'menu6' },
    update: {
      item_name: 'Chocolate Lava Cake',
      price: 11.5,
      description: 'Warm chocolate cake with molten center',
      category: 'Dessert',
      availability_status: true,
      viewCount: 60,
      branch_id: uptownBranch.id,
    },
    create: {
      id: 'menu6',
      item_name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center',
      price: 11.5,
      category: 'Dessert',
      availability_status: true,
      viewCount: 60,
      branch_id: uptownBranch.id,
    },
  });

  const inventoryAlert1 = await prisma.inventoryAlert.upsert({
    where: { id: 'inventory1' },
    update: {
      branch_id: branch.id,
      menuItemId: menuItem2.id,
      currentStock: 3,
      lowStockThreshold: 10,
      alertDate: new Date('2026-06-01T08:00:00Z'),
    },
    create: {
      id: 'inventory1',
      branch_id: branch.id,
      menuItemId: menuItem2.id,
      currentStock: 3,
      lowStockThreshold: 10,
      alertDate: new Date('2026-06-01T08:00:00Z'),
    },
  });

  const inventoryAlert2 = await prisma.inventoryAlert.upsert({
    where: { id: 'inventory2' },
    update: {
      branch_id: uptownBranch.id,
      menuItemId: menuItem5.id,
      currentStock: 5,
      lowStockThreshold: 12,
      alertDate: new Date('2026-06-02T09:30:00Z'),
    },
    create: {
      id: 'inventory2',
      branch_id: uptownBranch.id,
      menuItemId: menuItem5.id,
      currentStock: 5,
      lowStockThreshold: 12,
      alertDate: new Date('2026-06-02T09:30:00Z'),
    },
  });

  const order1 = await prisma.order.upsert({
    where: { id: 'order1' },
    update: {
      status: 'PAID',
      total_amount: 66.74,
      orderDate: new Date('2026-05-30T18:00:00Z'),
    },
    create: {
      id: 'order1',
      customer_id: customer.id,
      branch_id: branch.id,
      status: 'PAID',
      total_amount: 66.74,
      orderDate: new Date('2026-05-30T18:00:00Z'),
      items: {
        create: [
          { menuItemId: menuItem1.id, quantity: 1, price: 35.99 },
          { menuItemId: menuItem2.id, quantity: 1, price: 18.5 },
          { menuItemId: menuItem3.id, quantity: 1, price: 12.25 },
        ],
      },
    },
  });

  const order2 = await prisma.order.upsert({
    where: { id: 'order2' },
    update: {
      status: 'PAID',
      total_amount: 46.99,
      orderDate: new Date('2026-05-30T19:00:00Z'),
    },
    create: {
      id: 'order2',
      customer_id: repeatCustomer.id,
      branch_id: branch.id,
      status: 'PAID',
      total_amount: 46.99,
      orderDate: new Date('2026-05-30T19:00:00Z'),
      items: {
        create: [
          { menuItemId: menuItem2.id, quantity: 2, price: 18.5 },
          { menuItemId: menuItem3.id, quantity: 1, price: 9.99 },
        ],
      },
    },
  });

  const order3 = await prisma.order.upsert({
    where: { id: 'order3' },
    update: {
      status: 'PAID',
      total_amount: 50.49,
      orderDate: new Date('2026-05-31T20:00:00Z'),
    },
    create: {
      id: 'order3',
      customer_id: customer.id,
      branch_id: uptownBranch.id,
      status: 'PAID',
      total_amount: 50.49,
      orderDate: new Date('2026-05-31T20:00:00Z'),
      items: {
        create: [
          { menuItemId: menuItem4.id, quantity: 1, price: 29.0 },
          { menuItemId: menuItem5.id, quantity: 1, price: 9.99 },
          { menuItemId: menuItem6.id, quantity: 1, price: 11.5 },
        ],
      },
    },
  });

  const order4 = await prisma.order.upsert({
    where: { id: 'order4' },
    update: {
      status: 'PLACED',
      total_amount: 32.99,
      orderDate: new Date('2026-05-31T12:30:00Z'),
    },
    create: {
      id: 'order4',
      customer_id: repeatCustomer.id,
      branch_id: uptownBranch.id,
      status: 'PLACED',
      total_amount: 32.99,
      orderDate: new Date('2026-05-31T12:30:00Z'),
      items: {
        create: [
          { menuItemId: menuItem5.id, quantity: 1, price: 9.99 },
          { menuItemId: menuItem6.id, quantity: 2, price: 11.5 },
        ],
      },
    },
  });

  const order5 = await prisma.order.upsert({
    where: { id: 'order5' },
    update: {
      status: 'PAID',
      total_amount: 74.47,
      orderDate: new Date('2026-06-01T18:00:00Z'),
    },
    create: {
      id: 'order5',
      customer_id: repeatCustomer.id,
      branch_id: branch.id,
      status: 'PAID',
      total_amount: 74.47,
      orderDate: new Date('2026-06-01T18:00:00Z'),
      items: {
        create: [
          { menuItemId: menuItem1.id, quantity: 1, price: 35.99 },
          { menuItemId: menuItem2.id, quantity: 1, price: 18.5 },
          { menuItemId: menuItem5.id, quantity: 2, price: 9.99 },
        ],
      },
    },
  });

  console.log({ admin, hqManager, branchManager, waiter, customer, openAccess, repeatCustomer, branch, uptownBranch });
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
