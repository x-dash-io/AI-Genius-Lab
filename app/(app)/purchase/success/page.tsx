import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  Shield,
  Lock,
  Sparkles,
  Receipt,
  CreditCard,
  Calendar,
  User,
  Mail,
  Hash,
  FileText,
  Zap,
  Download
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CartClearer } from "@/components/cart/CartClearer";
import { InvoiceDownloadButton } from "@/components/purchase/InvoiceDownloadButton";
import Image from "next/image";

export const dynamic = "force-dynamic";

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

// Invoice Component for both single and multiple purchases
interface InvoiceProps {
  invoiceNumber: string;
  purchaseDate: Date;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  transactionId?: string;
  items: Array<{
    id: string;
    title: string;
    description?: string | null;
    amountCents: number;
    currency: string;
  }>;
  totalAmount: number;
  currency: string;
  isSinglePurchase: boolean;
  courseSlug?: string;
}

function ProfessionalInvoice({
  invoiceNumber,
  purchaseDate,
  customerName,
  customerEmail,
  paymentMethod,
  transactionId,
  items,
  totalAmount,
  currency,
  isSinglePurchase,
  courseSlug,
}: InvoiceProps) {
  return (
    <>
      {/* Success Animation Header */}
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-400/30" />
          <div className="relative rounded-full bg-gradient-to-br from-green-400 to-emerald-600 p-4 shadow-lg shadow-green-500/25">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Payment Successful!
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-md mx-auto">
          {isSinglePurchase
            ? "Thank you for your purchase. Your course is ready to explore."
            : "Thank you for your purchase. All courses are now unlocked in your library."
          }
        </p>
      </div>

      {/* Professional Invoice Card */}
      <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl dark:shadow-primary/5" id="invoice">
        <CardContent className="p-0">
          {/* Invoice Header - Gradient Banner */}
          <div className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20" />
            </div>

            <div className="relative px-6 py-8 md:px-10 md:py-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                {/* Company Branding */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Image
                        src="/logo.png"
                        alt="AI Genius Lab"
                        width={28}
                        height={28}
                        className="h-7 w-7"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-primary-foreground font-display tracking-tight">
                        AI Genius Lab
                      </h2>
                      <p className="text-sm text-primary-foreground/70">Premium Learning Platform</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Badge & Number */}
                <div className="text-left md:text-right space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <Receipt className="h-4 w-4 text-primary-foreground" />
                    <span className="text-sm font-semibold text-primary-foreground uppercase tracking-wider">Invoice</span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-primary-foreground tracking-wide">
                    {invoiceNumber}
                  </p>
                  <p className="text-sm text-primary-foreground/70">
                    {format(purchaseDate, "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="p-6 md:p-10 space-y-8 bg-gradient-to-b from-muted/30 to-background">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge className="px-4 py-2 text-sm bg-green-600 text-white dark:bg-green-900/30 dark:text-green-400 border-0">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Payment Confirmed
              </Badge>
            </div>

            {/* Billing & Payment Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Bill To */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                  <User className="h-4 w-4" />
                  <span>Billed To</span>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <p className="font-semibold text-lg">{customerName}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Payment Information</span>
                </div>
                <div className="p-4 rounded-xl bg-card border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Method</span>
                    <span className="font-semibold">{paymentMethod}</span>
                  </div>
                  {transactionId && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Transaction</span>
                      <span className="font-mono text-xs text-right max-w-[200px] break-all">
                        {transactionId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="font-semibold text-sm">
                      {format(purchaseDate, "MMM dd, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="border-gray-300" />

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                <FileText className="h-4 w-4" />
                <span>Purchased Items</span>
              </div>

              <div className="rounded-xl border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-foreground">
                        Course
                      </th>
                      <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-foreground w-32">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item, index) => (
                      <tr key={item.id} className="bg-card">
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-base">{item.title}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-mono text-muted-foreground">
                                  {item.id.slice(-8).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <p className="font-bold text-lg">
                            {formatCurrency(item.amountCents, item.currency)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-full md:w-96 space-y-3">
                <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(totalAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-semibold">{formatCurrency(0, currency)}</span>
                  </div>
                  <Separator className="border-gray-300" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total Paid</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(totalAmount, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators - Hidden when printing */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-muted-foreground">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-muted-foreground">SSL Encrypted</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center">
                <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-muted-foreground">Instant Access</span>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="p-4 rounded-xl bg-muted/30 border border-dashed">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Terms & Conditions:</strong>{" "}
                This invoice confirms your purchase of the listed digital course(s).
                All sales are final and non-refundable. You have been granted immediate
                and lifetime access to the purchased content in your library.
                No physical items will be shipped. For support, contact support@aigeniuslab.com.
              </p>
            </div>

            {/* Action Buttons - Hidden when printing */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {isSinglePurchase && courseSlug ? (
                <Link href={`/library/${courseSlug}`} className="flex-1">
                  <Button size="lg" variant="premium" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Learning Now
                  </Button>
                </Link>
              ) : (
                <Link href="/library" className="flex-1">
                  <Button size="lg" variant="premium" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Go to Library
                  </Button>
                </Link>
              )}
              <InvoiceDownloadButton
                invoiceNumber={invoiceNumber}
                purchaseDate={purchaseDate}
                customerName={customerName}
                customerEmail={customerEmail}
                paymentMethod={paymentMethod}
                transactionId={transactionId}
                items={items}
                totalAmount={totalAmount}
                currency={currency}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Browse More */}
      <div className="text-center">
        <Link href="/courses">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse More Courses
          </Button>
        </Link>
      </div>
    </>
  );
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

  // Handle multiple purchases (learning path) OR single purchase passed as "purchases"
  if (purchaseIdsParam) {
    const purchaseIds = purchaseIdsParam.split(",").filter(Boolean);
    if (purchaseIds.length === 0) {
      redirect("/library");
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        id: { in: purchaseIds },
        userId: session.user.id,
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
    });

    if (purchases.length === 0) {
      redirect("/library");
    }

    // If it's actually a single purchase, handle it as such
    if (purchases.length === 1) {
      const purchase = purchases[0];
      const payment = purchase.Payment[0];
      const purchaseDate = payment?.createdAt || purchase.createdAt;
      const invoiceNumber = generateInvoiceNumber(purchase.id);

      return (
        <section className="grid gap-8 max-w-4xl mx-auto px-4 py-8">
          <CartClearer courseIds={[purchase.Course.id]} />
          <ProfessionalInvoice
            invoiceNumber={invoiceNumber}
            purchaseDate={purchaseDate}
            customerName={session.user.name || "Customer"}
            customerEmail={session.user.email!}
            paymentMethod={formatPaymentMethod(payment?.provider)}
            transactionId={payment?.providerRef || undefined}
            items={[{
              id: purchase.Course.id,
              title: purchase.Course.title,
              description: purchase.Course.description,
              amountCents: purchase.amountCents,
              currency: purchase.currency,
            }]}
            totalAmount={purchase.amountCents}
            currency={purchase.currency}
            isSinglePurchase={true}
            courseSlug={purchase.Course.slug}
          />
        </section>
      );
    }

    // Multiple purchases
    const totalAmount = purchases.reduce((sum: number, p: any) => sum + p.amountCents, 0);
    const payment = purchases[0].Payment?.[0];
    const purchaseDate = payment?.createdAt || purchases[0].createdAt;
    const invoiceNumber = generateInvoiceNumber(purchases[0].id);

    // Get course IDs for cart clearing
    const purchasedCourseIds = purchases.map((p: any) => p.Course.id);

    return (
      <section className="grid gap-8 max-w-4xl mx-auto px-4 py-8">
        {/* Clear purchased items from cart */}
        <CartClearer courseIds={purchasedCourseIds} />
        <ProfessionalInvoice
          invoiceNumber={invoiceNumber}
          purchaseDate={purchaseDate}
          customerName={session.user.name || "Customer"}
          customerEmail={session.user.email!}
          paymentMethod={formatPaymentMethod(payment?.provider)}
          transactionId={payment?.providerRef || undefined}
          items={purchases.map((p: any) => ({
            id: p.Course.id,
            title: p.Course.title,
            description: p.Course.description,
            amountCents: p.amountCents,
            currency: p.currency,
          }))}
          totalAmount={totalAmount}
          currency={purchases[0].currency}
          isSinglePurchase={false}
        />
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
  });

  if (!purchase) {
    redirect("/library");
  }

  const payment = purchase.Payment[0];
  const purchaseDate = payment?.createdAt || purchase.createdAt;
  const invoiceNumber = generateInvoiceNumber(purchase.id);

  return (
    <section className="grid gap-8 max-w-4xl mx-auto px-4 py-8">
      {/* Clear purchased item from cart */}
      <CartClearer courseIds={[purchase.Course.id]} />
      <ProfessionalInvoice
        invoiceNumber={invoiceNumber}
        purchaseDate={purchaseDate}
        customerName={session.user.name || "Customer"}
        customerEmail={session.user.email!}
        paymentMethod={formatPaymentMethod(payment?.provider)}
        transactionId={payment?.providerRef || undefined}
        items={[{
          id: purchase.Course.id,
          title: purchase.Course.title,
          description: purchase.Course.description,
          amountCents: purchase.amountCents,
          currency: purchase.currency,
        }]}
        totalAmount={purchase.amountCents}
        currency={purchase.currency}
        isSinglePurchase={true}
        courseSlug={purchase.Course.slug}
      />
    </section>
  );
}

