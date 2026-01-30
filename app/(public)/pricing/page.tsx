import { prisma } from "@/lib/prisma";
// import { connection } from "next/server"; // Not available in Next.js 14
import { PricingGrid } from "@/components/subscriptions/PricingGrid";

export default async function PricingPage() {
  // await connection(); // Not available in Next.js 14
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { tier: "asc" }
  });

  return (
    <div className="container mx-auto py-24 px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-display text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that's right for you and start your AI learning journey today.
        </p>
      </div>

      <PricingGrid plans={plans} />

      <div className="mt-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          <div>
            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-muted-foreground text-sm">Yes, you can cancel your subscription at any time from your dashboard. You will continue to have access until the end of your billing period.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I buy individual courses?</h3>
            <p className="text-muted-foreground text-sm">Absolutely! You can still purchase courses individually even if you don't have a subscription.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
