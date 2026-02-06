/**
 * Data Migration Script: Update Subscription Tier Values using Raw SQL
 * 
 * This script updates existing subscription plan records from the old tier names
 * (pro, elite) to the new tier names (professional, founder) using raw SQL queries.
 */

import { prisma } from "../lib/prisma";

async function main() {
  console.log("Starting subscription tier migration using raw SQL...\n");

  try {
    // First, let's see what we have
    console.log("Current subscription plans:");
    const currentPlans = await prisma.$queryRaw`
      SELECT id, name, tier FROM "SubscriptionPlan"
    `;
    console.log(currentPlans);

    // Update 'pro' to 'professional' using raw SQL
    console.log("\nUpdating 'pro' tiers to 'professional'...");
    const updatePro = await prisma.$executeRaw`
      UPDATE "SubscriptionPlan" 
      SET tier = 'professional'
      WHERE tier = 'pro'
    `;
    console.log(`✅ Updated ${updatePro} 'pro' plans to 'professional'`);

    // Update 'elite' to 'founder' using raw SQL
    console.log("\nUpdating 'elite' tiers to 'founder'...");
    const updateElite = await prisma.$executeRaw`
      UPDATE "SubscriptionPlan" 
      SET tier = 'founder'
      WHERE tier = 'elite'
    `;
    console.log(`✅ Updated ${updateElite} 'elite' plans to 'founder'`);

    // Verify the changes
    console.log("\nUpdated subscription plans:");
    const updatedPlans = await prisma.$queryRaw`
      SELECT id, name, tier FROM "SubscriptionPlan"
    `;
    console.log(updatedPlans);

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
