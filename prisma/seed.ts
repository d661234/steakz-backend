import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // ── Users (upsert by email — safe to run repeatedly) ──────────────────────
  await prisma.user.upsert({
    where:  { email: 'admin@steakz.com' },
    update: { password_hash: password, role: UserRole.ADMIN, firstName: 'Admin', lastName: 'User' },
    create: { email: 'admin@steakz.com', password_hash: password, role: UserRole.ADMIN, firstName: 'Admin', lastName: 'User' },
  });

  // ── Branches (upsert by name) ──────────────────────────────────────────────
  const mainBranch = await prisma.branch.upsert({
    where:  { name: 'Steakz London Branch' },
    update: {},
    create: { name: 'Steakz London Branch', location_address: '123 Steakhouse Ave, London' },
  });

  const uptownBranch = await prisma.branch.upsert({
    where:  { name: 'Steakz Uptown Branch' },
    update: {},
    create: { name: 'Steakz Uptown Branch', location_address: '456 Grill Street, Manchester' },
  });

  // ── Menu items (only seed if branch has none yet) ─────────────────────────
  const mainMenuCount = await prisma.menuItem.count({ where: { branch_id: mainBranch.id } });
  if (mainMenuCount === 0) {
    await prisma.menuItem.createMany({
      data: [
        { item_name: 'Grilled Ribeye',   description: 'Juicy ribeye steak with garlic butter',                  price: 35.99, category: 'Main Course', availability_status: true,  viewCount: 125, branch_id: mainBranch.id },
        { item_name: 'Classic Cheeseburger', description: 'Beef burger with cheese, lettuce, and tomato',       price: 18.50, category: 'Main Course', availability_status: false, viewCount:  98, branch_id: mainBranch.id },
        { item_name: 'Caesar Salad',     description: 'Crisp romaine with parmesan and croutons',               price: 12.25, category: 'Appetizer',   availability_status: false, viewCount:  72, branch_id: mainBranch.id },
        { item_name: 'BBQ Beef Ribs',    description: 'Slow-smoked ribs glazed in smoky BBQ sauce',             price: 32.50, category: 'Main Course', availability_status: true,  viewCount:  89, branch_id: mainBranch.id },
        { item_name: 'Chicken Tikka',    description: 'Tender chicken marinated in spiced yoghurt, char-grilled', price: 22.00, category: 'Main Course', availability_status: true, viewCount: 74, branch_id: mainBranch.id },
        { item_name: 'Garlic Bread',     description: 'Toasted baguette with herb garlic butter',               price:  6.50, category: 'Appetizer',   availability_status: false, viewCount: 110, branch_id: mainBranch.id },
        { item_name: 'Mango Sorbet',     description: 'Refreshing tropical sorbet made from real mango',        price:  8.00, category: 'Dessert',     availability_status: true,  viewCount:  45, branch_id: mainBranch.id },
        { item_name: 'Iced Lemonade',    description: 'Freshly squeezed lemonade over crushed ice',             price:  4.50, category: 'Beverage',    availability_status: true,  viewCount: 130, branch_id: mainBranch.id },
        { item_name: 'sadza',            description: 'carbohydrates',                                          price:  5.00, category: 'Main Course', availability_status: true,  viewCount:   0, branch_id: mainBranch.id },
      ],
    });
  }

  const uptownMenuCount = await prisma.menuItem.count({ where: { branch_id: uptownBranch.id } });
  if (uptownMenuCount === 0) {
    await prisma.menuItem.createMany({
      data: [
        { item_name: 'Steak Frites',      description: 'Sirloin steak with fries and herb butter',                               price: 29.00, category: 'Main Course', availability_status: true, viewCount: 118, branch_id: uptownBranch.id },
        { item_name: 'Truffle Fries',     description: 'Crispy fries tossed in truffle oil',                                     price:  9.99, category: 'Side',        availability_status: true, viewCount:  84, branch_id: uptownBranch.id },
        { item_name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center',                               price: 11.50, category: 'Dessert',     availability_status: true, viewCount:  60, branch_id: uptownBranch.id },
        { item_name: 'Surf & Turf',       description: 'Filet mignon paired with grilled tiger prawns',                          price: 45.00, category: 'Main Course', availability_status: true, viewCount:  95, branch_id: uptownBranch.id },
        { item_name: 'Greek Salad',       description: 'Tomatoes, cucumber, olives, and feta with oregano dressing',             price: 11.00, category: 'Salad',       availability_status: true, viewCount:  55, branch_id: uptownBranch.id },
        { item_name: 'French Onion Soup', description: 'Rich caramelised onion broth topped with gruyère crouton',               price: 10.50, category: 'Appetizer',   availability_status: true, viewCount:  67, branch_id: uptownBranch.id },
        { item_name: 'Tiramisu',          description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone', price: 10.00, category: 'Dessert',     availability_status: true, viewCount:  78, branch_id: uptownBranch.id },
      ],
    });
  }

  console.log('✅ Seed complete');
  console.log(`   Admin  → admin@steakz.com  / password123`);
  console.log(`   HQ     → hq@steakz.com     / password123`);
  console.log(`   Manager→ branch_manager@steakz.com / password123  (${mainBranch.name})`);
  console.log(`   Waiter → waiter@steakz.com / password123  (${mainBranch.name})`);
  console.log(`   Customer→ customer@steakz.com / password123`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    throw e;
  });
