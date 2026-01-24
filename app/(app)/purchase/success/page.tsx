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
  Zap
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { PrintInvoiceButton } from "@/components/checkout/PrintInvoiceButton";
import { CartClearer } from "@/components/cart/CartClearer";

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
      {/* Success Animation Header - Hidden when printing */}
      <div className="text-center print:hidden">
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
      <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl dark:shadow-primary/5 print:shadow-none print:border print:border-gray-200" id="invoice">
        <CardContent className="p-0">
          {/* Invoice Header - Gradient Banner */}
          <div className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20" />
            </div>
            
            <div className="relative px-6 py-8 md:px-10 md:py-10 print:bg-primary print:py-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                {/* Company Branding */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm print:bg-white/10">
                      <Sparkles className="h-7 w-7 text-primary-foreground dark:text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-primary-foreground dark:text-white font-display tracking-tight">
                        AI Genius Lab
                      </h2>
                      <p className="text-sm text-primary-foreground/70 dark:text-white/70">Premium Learning Platform</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Badge & Number */}
                <div className="text-left md:text-right space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <Receipt className="h-4 w-4 text-primary-foreground dark:text-white" />
                    <span className="text-sm font-semibold text-primary-foreground dark:text-white uppercase tracking-wider">Invoice</span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-primary-foreground dark:text-white tracking-wide">
                    {invoiceNumber}
                  </p>
                  <p className="text-sm text-primary-foreground/70 dark:text-white/70">
                    {format(purchaseDate, "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="p-6 md:p-10 space-y-8 bg-gradient-to-b from-muted/30 to-background print:bg-white print:p-6">
            {/* Status Badge */}
            <div className="flex justify-center print:justify-start">
              <Badge className="px-4 py-2 text-sm bg-white-100 text-black-800 dark:bg-green-900/30 dark:text-green-400 border-0 print:bg-green-100 print:text-green-800">
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
                <div className="p-4 rounded-xl bg-card border print:border-gray-200 print:bg-gray-50">
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
                <div className="p-4 rounded-xl bg-card border print:border-gray-200 print:bg-gray-50 space-y-3">
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

            <Separator className="print:border-gray-300" />

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                <FileText className="h-4 w-4" />
                <span>Purchased Items</span>
              </div>
              
              <div className="rounded-xl border overflow-hidden print:border-gray-300">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 print:bg-gray-100">
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-foreground">
                        Course
                      </th>
                      <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-foreground w-32">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y print:divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={item.id} className="bg-card print:bg-white">
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 print:bg-gray-100 shrink-0">
                              <BookOpen className="h-5 w-5 text-primary print:text-gray-600" />
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
                <div className="p-4 rounded-xl bg-muted/50 print:bg-gray-50 print:border print:border-gray-200 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(totalAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-semibold">{formatCurrency(0, currency)}</span>
                  </div>
                  <Separator className="print:border-gray-300" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total Paid</span>
                    <span className="text-2xl font-bold text-primary print:text-black">
                      {formatCurrency(totalAmount, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators - Hidden when printing */}
            <div className="grid grid-cols-3 gap-4 pt-6 print:hidden">
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
            <div className="p-4 rounded-xl bg-muted/30 border border-dashed print:border-gray-300 print:bg-gray-50">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground print:text-black">Terms & Conditions:</strong>{" "}
                This invoice confirms your purchase of the listed digital course(s). 
                All sales are final and non-refundable. You have been granted immediate 
                and lifetime access to the purchased content in your library. 
                No physical items will be shipped. For support, contact support@aigeniuslab.com.
              </p>
            </div>

            {/* Action Buttons - Hidden when printing */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 print:hidden">
              {isSinglePurchase && courseSlug ? (
                <Link href={`/library/${courseSlug}`} className="flex-1">
                  <Button size="lg" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Learning Now
                  </Button>
                </Link>
              ) : (
                <Link href="/library" className="flex-1">
                  <Button size="lg" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Go to Library
                  </Button>
                </Link>
              )}
              <PrintInvoiceButton
                invoiceData={{
                  invoiceNumber,
                  purchaseDate,
                  customerName,
                  customerEmail,
                  paymentMethod,
                  transactionId,
                  items,
                  totalAmount,
                  currency,
                }}
              />
            </div>
          </div>

          {/* Footer - Print only */}
          <div className="hidden print:block p-6 border-t border-gray-200 bg-gray-50 text-center" data-print-show="true">
            <p className="text-xs text-gray-500">
              AI Genius Lab • Premium Online Learning Platform • support@aigeniuslab.com
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Thank you for your purchase!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Browse More - Hidden when printing */}
      <div className="text-center print:hidden">
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

    // Get course IDs for cart clearing
    const purchasedCourseIds = purchases.map(p => p.course.id);

    return (
      <section className="grid gap-8 max-w-4xl mx-auto px-4 py-8 print:max-w-full print:mx-0 print:px-0 print:py-0">
        {/* Clear purchased items from cart */}
        <CartClearer courseIds={purchasedCourseIds} />
        <ProfessionalInvoice
          invoiceNumber={invoiceNumber}
          purchaseDate={purchaseDate}
          customerName={session.user.name || "Customer"}
          customerEmail={session.user.email!}
          paymentMethod={formatPaymentMethod(payment?.provider)}
          transactionId={payment?.providerRef || undefined}
          items={purchases.map(p => ({
            id: p.course.id,
            title: p.course.title,
            description: p.course.description,
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
    <section className="grid gap-8 max-w-4xl mx-auto px-4 py-8 print:max-w-full print:mx-0 print:px-0 print:py-0">
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
