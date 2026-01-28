import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { syncSubscriptionPlansToPayPal } from "../lib/subscriptions";

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting sync of subscription plans to PayPal...");

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.error("Error: PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set in your environment.");
    process.exit(1);
  }

  try {
    await syncSubscriptionPlansToPayPal();
    console.log("Successfully synced subscription plans to PayPal.");
  } catch (error) {
    console.error("Failed to sync plans:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
