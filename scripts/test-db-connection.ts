import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function testConnection() {
  console.log("Testing database connection...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 50) + "...");
  
  try {
    // Try to connect
    await prisma.$connect();
    console.log("✅ Database connected successfully!");
    
    // Try a simple query
    const count = await prisma.user.count();
    console.log(`✅ Query successful! Found ${count} users.`);
    
    await prisma.$disconnect();
    console.log("✅ Database disconnected successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
