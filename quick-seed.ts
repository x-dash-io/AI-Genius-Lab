import { PrismaClient } from '@prisma/client';
import { hashPassword } from './lib/password';

const prisma = new PrismaClient();

async function main() {
  const hash = await hashPassword('admin123');
  
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      passwordHash: hash,
      role: 'admin'
    }
  });
  
  await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      name: 'Test Customer',
      passwordHash: hash,
      role: 'customer'
    }
  });
  
  console.log('✅ Users created:');
  console.log('   Admin: admin@test.com / admin123');
  console.log('   Customer: customer@test.com / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
