import { prisma } from "@/lib/prisma";
// import { connection } from "next/server"; // Not available in Next.js 14
import Link from "next/link";
import { PricingGrid } from "@/components/subscriptions/PricingGrid";
import { Button } from "@/components/ui/button";
import { Zap, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  // await connection(); // Not available in Next.js 14
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { tier: "asc" }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 sm:py-28">
        <div className="text-center max-w-3xl mx-auto mb-4">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4 gap-2">
            <Award className="h-4 w-4" />
            Flexible Learning Plans
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight mb-4">
            Invest in Your AI Future
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan to master AI. From free courses to premium access with certificates and dedicated support.
          </p>
        </div>

        {/* Pricing Grid */}
        <PricingGrid plans={plans} />

        {/* Comparison Table */}
        <div className="mt-32">
          <h2 className="text-center text-3xl font-bold mb-12">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse overflow-x-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  {plans.map((plan: any) => (
                    <th key={plan.id} className="text-center py-4 px-4 font-semibold min-w-[100px]">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b hover:bg-muted/30">
                  <td className="py-4 px-4">Courses</td>
                  {plans.map((plan: any) => (
                    <td key={plan.id} className="text-center py-4 px-4 min-w-[100px]">
                      <span className="font-medium">{plan.tier === "starter" ? "Select" : "All"}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/30">
                  <td className="py-4 px-4">Certificates</td>
                  {plans.map((plan: any) => (
                    <td key={plan.id} className="text-center py-4 px-4 min-w-[100px]">
                      {plan.tier !== "starter" ? "✓" : "—"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/30">
                  <td className="py-4 px-4">Learning Paths</td>
                  {plans.map((plan: any) => (
                    <td key={plan.id} className="text-center py-4 px-4 min-w-[100px]">
                      {plan.tier === "elite" ? "✓" : "—"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/30">
                  <td className="py-4 px-4">Support</td>
                  {plans.map((plan: any) => (
                    <td key={plan.id} className="text-center py-4 px-4 min-w-[100px]">
                      <span className="text-xs">{plan.tier === "starter" ? "Community" : plan.tier === "pro" ? "Standard" : "Priority"}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32">
          <h2 className="text-center text-3xl font-bold mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
              <h3 className="font-semibold mb-3 text-lg">Can I cancel anytime?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Yes, cancel your subscription at any time from your dashboard. You'll have access until the end of your billing period.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
              <h3 className="font-semibold mb-3 text-lg">Can I buy individual courses?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Absolutely! Purchase individual courses without a subscription. Subscriptions offer better value if you want unlimited access.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
              <h3 className="font-semibold mb-3 text-lg">Can I switch plans?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Yes, upgrade or downgrade your plan anytime. Changes take effect immediately.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
              <h3 className="font-semibold mb-3 text-lg">Is there a free trial?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Access free courses to explore our content. Subscribe when you're ready for full access and certificates.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners mastering AI with our structured courses and learning paths.
          </p>
          <Link href="/courses">
            <Button size="lg" className="h-12 text-base">
              Explore Courses →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
