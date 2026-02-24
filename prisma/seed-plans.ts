import { PrismaClient, SubscriptionTier } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const plans = [
    {
      id: "plan_starter",
      name: "Starter",
      description: "Access to free starter courses.",
      tier: "starter" as SubscriptionTier,
      priceMonthlyCents: 0,
      priceAnnualCents: 0,
    },
    {
      id: "plan_professional",
      name: "Professional",
      description: "Access to professional-tier courses + certificates.",
      tier: "professional" as SubscriptionTier,
      priceMonthlyCents: 1999,
      priceAnnualCents: 19900,
    },
    {
      id: "plan_founder",
      name: "Founder",
      description: "Access to founder-tier courses + learning paths + certificates.",
      tier: "founder" as SubscriptionTier,
      priceMonthlyCents: 2999,
      priceAnnualCents: 29900,
    }
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan
    });
  }

  console.log("Subscription plans seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
