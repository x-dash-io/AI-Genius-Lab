import { Suspense } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { syncSubscriptionPlansToPayPal } from "@/lib/subscriptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Edit } from "lucide-react";
import { revalidatePath } from "next/cache";
import { SubscriptionPlanForm } from "@/components/admin/SubscriptionPlanForm";
import { SyncPlansButton } from "@/components/admin/SyncPlansButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteSubscriptionPlanAction } from "@/app/actions/delete-actions";

async function syncPlansAction() {
  "use server";
  await requireRole("admin");
  const result = await syncSubscriptionPlansToPayPal();
  revalidatePath("/admin/subscriptions/plans");
  return result;
}

async function savePlanAction(formData: FormData) {
  "use server";
  await requireRole("admin");

  const id = formData.get("id") as string;
  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    tier: formData.get("tier") as any,
    priceMonthlyCents: Math.round(parseFloat(formData.get("priceMonthly") as string) * 100),
    priceAnnualCents: Math.round(parseFloat(formData.get("priceAnnual") as string) * 100),
    isActive: formData.get("isActive") === "on",
  };

  if (id) {
    await prisma.subscriptionPlan.update({ where: { id }, data });
  } else {
    await prisma.subscriptionPlan.create({ data });
  }

  revalidatePath("/admin/subscriptions/plans");
}

async function PlansList() {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { tier: "asc" }
  });

  return (
    <div className="space-y-4">
      {plans.map((plan: any) => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <Badge className="capitalize">{plan.tier}</Badge>
                  {plan.isActive ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div>
                  <p className="text-lg font-bold">${(plan.priceMonthlyCents / 100).toFixed(2)}/mo</p>
                  <p className="text-sm text-muted-foreground">${(plan.priceAnnualCents / 100).toFixed(2)}/yr</p>
                </div>
                <Link href={`/admin/subscriptions/plans?edit=${plan.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <DeleteButton
                  id={plan.id}
                  title={plan.name}
                  description="This will permanently delete the subscription plan. Plans with active subscribers cannot be deleted."
                  onDelete={deleteSubscriptionPlanAction}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">PayPal Product ID</p>
                <p className="font-mono">{plan.paypalProductId || "Not synced"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Monthly Plan ID</p>
                <p className="font-mono">{plan.paypalMonthlyPlanId || "Not synced"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Annual Plan ID</p>
                <p className="font-mono">{plan.paypalAnnualPlanId || "Not synced"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {plans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-20" />
            <p>No subscription plans found. Please seed the database.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await requireRole("admin");
  const { edit: editId } = await searchParams;

  const editPlan = editId ? await prisma.subscriptionPlan.findUnique({ where: { id: editId } }) : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Subscription Management
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Subscription Plans
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage your subscription tiers and sync them with PayPal.
          </p>
        </div>
        <SyncPlansButton syncAction={syncPlansAction} />
      </div>

      <SubscriptionPlanForm
        initialData={editPlan ? {
          ...editPlan,
          description: editPlan.description || "",
        } : undefined}
        saveAction={savePlanAction}
      />

      <h2 className="text-2xl font-bold tracking-tight mt-12">Existing Plans</h2>
      <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <PlansList />
      </Suspense>
    </div>
  );
}
