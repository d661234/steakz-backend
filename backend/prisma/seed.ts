import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@steakz.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password_hash: hashedPassword,
      role: UserRole.SYSTEM_ADMIN,
    },
  });

  console.log({ admin });

  // Create a default branch
  const branch = await prisma.branch.upsert({
    where: { name: 'Main Branch' },
    update: {},
    create: {
      name: 'Main Branch',
      location_address: '123 Steakhouse Ave, Meat City',
    },
  });

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
