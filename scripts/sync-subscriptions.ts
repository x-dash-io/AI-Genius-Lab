/**
 * Manual Subscription Sync Script
 * 
 * This script iterates through all "pending" subscriptions in the database
 * and checks their current status on PayPal. If they are active on PayPal,
 * it activates them in our database.
 */

import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { prisma } from "../lib/prisma";
import { refreshSubscriptionStatus } from "../lib/subscriptions";

async function main() {
    console.log("Starting manual subscription sync...");

    // Find all pending subscriptions
    const pendingSubscriptions = await prisma.subscription.findMany({
        where: {
            status: "pending",
            paypalSubscriptionId: { not: null }
        },
        include: {
            user: { select: { email: true } },
            plan: { select: { name: true } }
        }
    });
    type PendingSubscription = (typeof pendingSubscriptions)[number];

    console.log(`Found ${pendingSubscriptions.length} pending subscriptions to check.\n`);

    let activatedCount = 0;
    let stayedPendingCount = 0;

    for (const sub of pendingSubscriptions) {
        const typedSubscription = sub as PendingSubscription;
        const userEmail = typedSubscription.user?.email || "Unknown User";
        process.stdout.write(`Checking subscription ${sub.id} for ${userEmail} (${sub.plan.name})... `);

        try {
            const refreshed = await refreshSubscriptionStatus(sub.id);

            if (refreshed && refreshed.status === "active") {
                console.log("✅ ACTIVATED");
                activatedCount++;
            } else {
                console.log("Still pending");
                stayedPendingCount++;
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.log(`❌ ERROR: ${message}`);
        }
    }

    console.log("\nSync Summary:");
    console.log(`- Total Checked: ${pendingSubscriptions.length}`);
    console.log(`- Activated: ${activatedCount}`);
    console.log(`- Still Pending: ${stayedPendingCount}`);

    console.log("\n✅ Manual sync completed!");
}

main()
    .catch((error) => {
        console.error("Fatal error during sync:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
