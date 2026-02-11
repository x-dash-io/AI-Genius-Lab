import Link from "next/link";
import { getServerSession } from "next-auth";
import { AlertCircle, Award, BadgeCheck, CreditCard, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { PricingGrid } from "@/components/subscriptions/PricingGrid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";

export const dynamic = "force-dynamic";

const faqs = [
  {
    question: "Can I switch billing cadence later?",
    answer:
      "Yes. You can switch between monthly and yearly billing from your subscription settings when your plan supports it.",
  },
  {
    question: "How are subscriptions processed?",
    answer:
      "Subscription payments are processed securely through PayPal and reflected in your profile billing history.",
  },
  {
    question: "Do plans include certificates?",
    answer:
      "Starter excludes certificates. Professional and Founder tiers include course certificates, with learning-path certificates on Founder.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel at any time. Access remains active until the end of the current billing period.",
  },
];

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
  });

  let currentPlanId: string | null = null;

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
      const starterPlan = plans.find((plan) => plan.tier === "starter");
      currentPlanId = starterPlan?.id ?? null;
    }
  }

  return (
    <PageContainer className="space-y-8 lg:space-y-10">
      <PageHeader
        title="Subscription Pricing"
        description="Choose a tier, set billing cadence, and scale from individual learning to full-stack founder access."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Pricing" },
        ]}
        actions={
          <Link href="/courses">
            <Button variant="outline">Browse Courses</Button>
          </Link>
        }
      />

      <Toolbar className="justify-between">
        <div className="grid gap-1">
          <p className="text-sm font-semibold">Billing policies</p>
          <p className="text-sm text-muted-foreground">
            PayPal billing, transparent cadence, and no hidden fees.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Secure checkout
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1">
            <CreditCard className="h-3.5 w-3.5 text-primary" />
            Clear billing cadence
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" />
            Verified receipts
          </span>
        </div>
      </Toolbar>

      <ContentRegion>
        <PricingGrid plans={plans} currentPlanId={currentPlanId} />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="ui-surface">
            <CardHeader>
              <CardTitle>Frequently asked questions</CardTitle>
              <CardDescription>Policy and billing answers before checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-[var(--radius-sm)] border bg-background px-4 py-3">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                    {faq.question}
                  </summary>
                  <p className="pt-2 text-sm text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </CardContent>
          </Card>

          <Card className="ui-surface">
            <CardHeader>
              <CardTitle>Enterprise onboarding</CardTitle>
              <CardDescription>Need rollout support for your team?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We can help map subscriptions to learner cohorts, align billing cadence, and coordinate migration.
              </p>
              <div className="grid gap-2">
                <span className="inline-flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Structured onboarding plans
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Secure checkout process
                </span>
              </div>
              <Link href="/contact" className="block pt-1">
                <Button className="w-full" variant="premium">
                  Contact sales
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </ContentRegion>

      <StatusRegion>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Billing disclaimer</AlertTitle>
          <AlertDescription>
            Subscription renewals follow your selected cadence. For yearly billing, savings are reflected in annual pricing and shown before payment confirmation.
          </AlertDescription>
        </Alert>
      </StatusRegion>
    </PageContainer>
  );
}
