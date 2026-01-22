import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

async function main() {
  const email = process.argv[2] || "admin@synapze.dev";
  const password = process.argv[3] || "password123";
  const name = process.argv[4] || "Admin User";

  if (!email || !password) {
    console.error("Usage: tsx scripts/create-admin.ts <email> <password> [name]");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "admin",
      name,
    },
    create: {
      email,
      passwordHash,
      name,
      role: "admin",
    },
  });

  console.log(`✅ Admin user created/updated:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   ID: ${user.id}`);
}

main()
  .catch((error) => {
    console.error("Error creating admin user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
