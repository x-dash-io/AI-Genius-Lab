import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { PricingGrid } from "@/components/subscriptions/PricingGrid";
import { Button } from "@/components/ui/button";
import { Award, MessageCircle, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const faqs = [
  {
    question: "Can I switch plans later?",
    answer:
      "Yes. You can upgrade or downgrade at any time, and the platform updates your billing access automatically.",
  },
  {
    question: "Do all paid plans include certificates?",
    answer:
      "Yes. Paid plans include completion certificates and path outcomes, while Starter gives you limited previews to evaluate fit.",
  },
  {
    question: "Do you support teams and enterprise onboarding?",
    answer:
      "Yes. Contact sales for team provisioning, role-based access, and custom onboarding support.",
  },
  {
    question: "Can I cancel at any time?",
    answer:
      "Absolutely. Cancel from your account settings; access continues through the current billing cycle.",
  },
];

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
  });

  let currentPlanId = null;

  if (session?.user?.id) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "active",
      },
      select: {
        planId: true,
      },
    });

    if (activeSubscription) {
      currentPlanId = activeSubscription.planId;
    } else {
      const starterPlan = plans.find((p) => p.tier === "starter");
      currentPlanId = starterPlan?.id || null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-5 gap-2">
            <Award className="h-4 w-4" />
            Flexible plans for every stage
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight mb-4">
            Pricing built for learning outcomes
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick a plan that matches your goals—from independent upskilling to enterprise rollout. Keep it simple, scale when needed.
          </p>
        </div>

        <PricingGrid plans={plans} currentPlanId={currentPlanId} />

        <section id="faq" className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border bg-card/70 p-5 open:border-primary/40">
                <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  <span className="text-xs font-bold text-muted-foreground group-open:text-primary">Open</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-3xl border bg-card/70 p-7 sm:p-10 max-w-5xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">Need enterprise support?</h3>
              <p className="text-sm text-muted-foreground">
                Get help with rollout strategy, team onboarding, and plan guidance for your organization.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><ShieldCheck className="h-3.5 w-3.5" /> Secure billing</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1"><MessageCircle className="h-3.5 w-3.5" /> Fast support</span>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-3">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="premium" size="lg" className="w-full sm:w-auto rounded-2xl">
                  Contact sales
                </Button>
              </Link>
              <Link href="/courses" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl">
                  Explore courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
