import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, BookOpen, Shield, Lock, Building2, Mail, Phone, Globe } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { PrintInvoiceButton } from "@/components/checkout/PrintInvoiceButton";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ purchase?: string; purchases?: string }>;
};

function formatCurrency(cents: number, currency: string = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function generateInvoiceNumber(purchaseId: string): string {
  // Format: INV-YYYYMMDD-XXXXX (last 8 chars of purchase ID)
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const suffix = purchaseId.slice(-8).toUpperCase();
  return `INV-${year}${month}${day}-${suffix}`;
}

function formatPaymentMethod(provider: string | undefined): string {
  if (!provider) return "PayPal";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const purchaseId = resolvedSearchParams?.purchase;
  const purchaseIdsParam = resolvedSearchParams?.purchases;

  // Handle multiple purchases (learning path)
  if (purchaseIdsParam) {
    const purchaseIds = purchaseIdsParam.split(",").filter(Boolean);
    if (purchaseIds.length === 0) {
      redirect("/library");
    }
    
    const purchases = await prisma.purchase.findMany({
      where: {
        id: { in: purchaseIds },
        userId: session.user.id,
        // Don't filter by status - we just completed payment, so it should exist
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (purchases.length === 0) {
      redirect("/library");
    }

    const totalAmount = purchases.reduce((sum, p) => sum + p.amountCents, 0);
    const payment = purchases[0].payments[0];
    const purchaseDate = payment?.createdAt || purchases[0].createdAt;
    const invoiceNumber = generateInvoiceNumber(purchases[0].id);

    return (
      <section className="grid gap-4 max-w-4xl mx-auto px-4 print:px-0">
        {/* Success Header */}
        <div className="text-center print:hidden">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Payment Successful!
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Thank you for your purchase. You now have access to all courses in this learning path.
          </p>
        </div>

        {/* Professional Invoice */}
        <Card className="border-2 shadow-lg print:shadow-none print:border">
          <CardContent className="p-0">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-b print:bg-white print:border-b-2">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  {/* Company Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold font-display">Synapze</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">Online Learning Platform</p>
                  </div>

                  {/* Invoice Details */}
                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Number</p>
                      <p className="text-base font-bold font-mono">{invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Date</p>
                      <p className="text-sm font-semibold">{format(purchaseDate, "MMMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Status</p>
                      <Badge variant="default" className="mt-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Billing Information */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Bill To</h3>
                  <div className="space-y-1">
                    <p className="font-semibold text-base">{session.user.name || "Customer"}</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Payment Details</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Method</p>
                      <p className="font-semibold capitalize">{formatPaymentMethod(payment?.provider)}</p>
                    </div>
                    {payment?.providerRef && (
                      <div>
                        <p className="text-xs text-muted-foreground">Transaction ID</p>
                        <p className="font-mono text-xs break-all">{payment.providerRef}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Date</p>
                      <p className="font-semibold text-sm">{format(purchaseDate, "MMM dd, yyyy 'at' h:mm a")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Items Table */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Items Purchased</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Item</th>
                        <th className="text-right p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase, index) => (
                        <tr key={purchase.id} className="border-t">
                          <td className="p-4">
                            <p className="font-semibold">{purchase.course.title}</p>
                            {purchase.course.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {purchase.course.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">Course ID: {purchase.course.id.slice(-8).toUpperCase()}</p>
                          </td>
                          <td className="p-4 text-right">
                            <p className="font-semibold text-sm">
                              {formatCurrency(purchase.amountCents, purchase.currency)}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full md:w-80 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(totalAmount, purchases[0].currency)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Tax</span>
                    <span className="font-semibold">{formatCurrency(0, purchases[0].currency)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold">{formatCurrency(totalAmount, purchases[0].currency)}</span>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t print:hidden">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Instant Access</span>
                </div>
              </div>

              {/* Terms */}
              <div className="pt-6 border-t">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Terms & Conditions:</strong> This invoice confirms your purchase of the listed courses. 
                  All sales are final. You have immediate access to the purchased courses in your library. 
                  This is a digital product and no physical items will be shipped.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 print:hidden">
                <Link href="/library" className="flex-1">
                  <Button size="lg" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Go to Library
                  </Button>
                </Link>
                <PrintInvoiceButton />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center print:hidden">
          <Link href="/courses">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse More Courses
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  // Single purchase
  if (!purchaseId) {
    redirect("/library");
  }

  const purchase = await prisma.purchase.findFirst({
    where: {
      id: purchaseId,
      userId: session.user.id,
      // Don't filter by status - we just completed payment, so it should exist
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!purchase) {
    redirect("/library");
  }

  const payment = purchase.payments[0];
  const purchaseDate = payment?.createdAt || purchase.createdAt;
  const invoiceNumber = generateInvoiceNumber(purchase.id);

  return (
    <section className="grid gap-8 max-w-5xl mx-auto px-4 print:px-0">
      {/* Success Header */}
      <div className="text-center print:hidden">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Payment Successful!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Thank you for your purchase. You now have access to this course.
        </p>
      </div>

      {/* Professional Invoice */}
      <Card className="border-2 shadow-lg print:shadow-none print:border">
        <CardContent className="p-0">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-b print:bg-white print:border-b-2">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                {/* Company Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold font-display">Synapze</h2>
                  </div>
                    <p className="text-sm text-muted-foreground">Online Learning Platform</p>
                  </div>

                {/* Invoice Details */}
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Number</p>
                    <p className="text-lg font-bold font-mono">{invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Date</p>
                    <p className="text-sm font-semibold">{format(purchaseDate, "MMMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Status</p>
                    <Badge variant="default" className="mt-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Billing Information */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Bill To</h3>
                <div className="space-y-1">
                  <p className="font-semibold text-base">{session.user.name || "Customer"}</p>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Payment Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <p className="font-semibold capitalize">{formatPaymentMethod(payment?.provider)}</p>
                  </div>
                  {payment?.providerRef && (
                    <div>
                      <p className="text-xs text-muted-foreground">Transaction ID</p>
                      <p className="font-mono text-xs break-all">{payment.providerRef}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Date</p>
                    <p className="font-semibold text-sm">{format(purchaseDate, "MMM dd, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Items Table */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Item Purchased</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Item</th>
                      <th className="text-right p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4">
                        <p className="font-semibold text-base">{purchase.course.title}</p>
                        {purchase.course.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {purchase.course.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">Course ID: {purchase.course.id.slice(-8).toUpperCase()}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-semibold text-base">
                          {formatCurrency(purchase.amountCents, purchase.currency)}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-80 space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(purchase.amountCents, purchase.currency)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="font-semibold">{formatCurrency(0, purchase.currency)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold">{formatCurrency(purchase.amountCents, purchase.currency)}</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t print:hidden">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>Instant Access</span>
              </div>
            </div>

            {/* Terms */}
            <div className="pt-6 border-t">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Terms & Conditions:</strong> This invoice confirms your purchase of the listed course. 
                All sales are final. You have immediate access to the purchased course in your library. 
                This is a digital product and no physical items will be shipped.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 print:hidden">
              <Link href={`/library/${purchase.course.slug}`} className="flex-1">
                <Button size="lg" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </Link>
              <PrintInvoiceButton />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center print:hidden">
        <Link href="/courses">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse More Courses
          </Button>
        </Link>
      </div>
    </section>
  );
}
