import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { format } from "date-fns";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CartClearer } from "@/components/cart/CartClearer";
import { InvoiceDownloadButton } from "@/components/purchase/InvoiceDownloadButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";
import { ArrowLeft, BookOpen, CheckCircle2, CreditCard, Receipt, ShieldCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ purchase?: string; purchases?: string }>;
};

type PurchaseRecord = {
  id: string;
  amountCents: number;
  currency: string;
  createdAt: Date;
  Course: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
  };
  Payment: Array<{
    provider: string | null;
    providerRef: string | null;
    createdAt: Date;
  }>;
};

function formatCurrency(cents: number, currency: string = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function generateInvoiceNumber(purchaseId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const suffix = purchaseId.slice(-8).toUpperCase();
  return `INV-${year}${month}${day}-${suffix}`;
}

function formatPaymentMethod(provider: string | null | undefined): string {
  if (!provider) return "PayPal";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

async function fetchPurchasesForUser(userId: string, purchaseIds: string[]): Promise<PurchaseRecord[]> {
  return prisma.purchase.findMany({
    where: {
      id: { in: purchaseIds },
      userId,
    },
    include: {
      Course: {
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
        },
      },
      Payment: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  }) as Promise<PurchaseRecord[]>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const purchaseId = resolvedSearchParams?.purchase;
  const purchaseIdsParam = resolvedSearchParams?.purchases;

  const purchaseIds = purchaseIdsParam
    ? purchaseIdsParam.split(",").map((id) => id.trim()).filter(Boolean)
    : purchaseId
      ? [purchaseId]
      : [];

  if (!purchaseIds.length) {
    redirect("/library");
  }

  const purchases = await fetchPurchasesForUser(session.user.id, purchaseIds);

  if (!purchases.length) {
    redirect("/library");
  }

  const first = purchases[0];
  const latestPayment = first.Payment[0];
  const purchaseDate = latestPayment?.createdAt || first.createdAt;
  const currency = first.currency;
  const invoiceNumber = generateInvoiceNumber(first.id);
  const totalAmount = purchases.reduce((sum, p) => sum + p.amountCents, 0);
  const purchasedCourseIds = purchases.map((p) => p.Course.id);
  const isSinglePurchase = purchases.length === 1;
  const primaryCourse = isSinglePurchase ? purchases[0].Course : null;

  return (
    <PageContainer width="wide" className="space-y-6">
      <CartClearer courseIds={purchasedCourseIds} />

      <PageHeader
        title="Purchase Confirmed"
        description={
          isSinglePurchase
            ? "Your course is unlocked and ready in your library."
            : "All selected courses are unlocked and ready in your library."
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Purchase Success" },
        ]}
        actions={
          <Link href={primaryCourse ? `/library/${primaryCourse.slug}` : "/library"}>
            <Button variant="premium">
              <BookOpen className="mr-2 h-4 w-4" />
              {primaryCourse ? "Start Learning" : "Open Library"}
            </Button>
          </Link>
        }
      />

      <Toolbar className="justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Payment successful
          </Badge>
          <Badge variant="outline" className="inline-flex items-center gap-1">
            <Receipt className="h-3.5 w-3.5" />
            {invoiceNumber}
          </Badge>
        </div>
        <span className="text-sm font-semibold">Total: {formatCurrency(totalAmount, currency)}</span>
      </Toolbar>

      <ContentRegion>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="ui-surface">
            <CardHeader>
              <CardTitle>Purchased Courses</CardTitle>
              <CardDescription>
                {isSinglePurchase ? "1 course unlocked" : `${purchases.length} courses unlocked`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {purchases.map((purchase) => (
                <article
                  key={purchase.id}
                  className="grid gap-3 rounded-[var(--radius-sm)] border bg-background px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{purchase.Course.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {purchase.Course.description || "Practical course modules with guided outcomes."}
                    </p>
                    <Link href={`/courses/${purchase.Course.slug}`} className="inline-flex">
                      <Button variant="ghost" size="sm">View course detail</Button>
                    </Link>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-base font-semibold">{formatCurrency(purchase.amountCents, purchase.currency)}</p>
                    <p className="text-xs text-muted-foreground">Course ID {purchase.Course.id.slice(-6).toUpperCase()}</p>
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="ui-surface">
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-semibold">{invoiceNumber}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-semibold">{format(purchaseDate, "PPP")}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Method</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <CreditCard className="h-4 w-4" />
                    {formatPaymentMethod(latestPayment?.provider)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Transaction</span>
                  <span className="max-w-[11rem] truncate font-mono text-xs">
                    {latestPayment?.providerRef || "Pending reference"}
                  </span>
                </div>
                <div className="rounded-[var(--radius-sm)] border bg-background px-3 py-2">
                  <p className="text-xs text-muted-foreground">Billed to</p>
                  <p className="mt-1 text-sm font-semibold">{session.user.name || "Customer"}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="ui-surface">
              <CardContent className="space-y-3 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  Secure payment complete
                </p>
                <p className="text-xs text-muted-foreground">
                  Access is granted immediately after payment confirmation. Keep this invoice for your records.
                </p>
                <InvoiceDownloadButton
                  invoiceNumber={invoiceNumber}
                  purchaseDate={purchaseDate}
                  customerName={session.user.name || "Customer"}
                  customerEmail={session.user.email!}
                  paymentMethod={formatPaymentMethod(latestPayment?.provider)}
                  transactionId={latestPayment?.providerRef || undefined}
                  items={purchases.map((p) => ({
                    title: p.Course.title,
                    amountCents: p.amountCents,
                    currency: p.currency,
                  }))}
                  totalAmount={totalAmount}
                  currency={currency}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </ContentRegion>

      <StatusRegion>
        <Card className="ui-surface">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Continue learning or explore additional courses.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={primaryCourse ? `/library/${primaryCourse.slug}` : "/library"}>
                <Button size="sm">Open Learning Workspace</Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Browse More Courses
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </StatusRegion>
    </PageContainer>
  );
}
