import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ArrowLeft, BookOpen } from "lucide-react";
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
    const purchaseIds = purchaseIdsParam.split(",");
    const purchases = await prisma.purchase.findMany({
      where: {
        id: { in: purchaseIds },
        userId: session.user.id,
        status: "paid",
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
          where: { status: "paid" },
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

    return (
      <section className="grid gap-8 max-w-4xl mx-auto">
        <div className="text-center">
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Invoice</CardTitle>
                <CardDescription>
                  Invoice #{purchases[0].id.slice(-8).toUpperCase()}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{format(purchaseDate, "MMM dd, yyyy")}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-2">Bill To</h3>
                <p className="text-sm">{session.user.name || "Customer"}</p>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Payment Method</h3>
                <p className="text-sm capitalize">{payment?.provider || "paypal"}</p>
                {payment?.providerRef && (
                  <p className="text-xs text-muted-foreground">
                    Transaction ID: {payment.providerRef.slice(-12)}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Items Purchased</h3>
              <div className="space-y-3">
                {purchases.map((purchase, index) => (
                  <div
                    key={purchase.id}
                    className="flex items-start justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{purchase.course.title}</p>
                      {purchase.course.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {purchase.course.description.slice(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold">
                        {formatCurrency(purchase.amountCents, purchase.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">
                {formatCurrency(totalAmount, purchases[0].currency)}
              </span>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/library" className="flex-1">
                <Button size="lg" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Go to Library
                </Button>
              </Link>
              <PrintInvoiceButton />
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
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
      status: "paid",
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
        where: { status: "paid" },
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

  return (
    <section className="grid gap-8 max-w-4xl mx-auto">
      <div className="text-center">
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice</CardTitle>
              <CardDescription>
                Invoice #{purchase.id.slice(-8).toUpperCase()}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-semibold">{format(purchaseDate, "MMM dd, yyyy")}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Bill To</h3>
              <p className="text-sm">{session.user.name || "Customer"}</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Payment Method</h3>
              <p className="text-sm capitalize">{payment?.provider || "paypal"}</p>
              {payment?.providerRef && (
                <p className="text-xs text-muted-foreground">
                  Transaction ID: {payment.providerRef.slice(-12)}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Item */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Item Purchased</h3>
            <div className="flex items-start justify-between py-2">
              <div className="flex-1">
                <p className="font-medium text-lg">{purchase.course.title}</p>
                {purchase.course.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {purchase.course.description}
                  </p>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-lg">
                  {formatCurrency(purchase.amountCents, purchase.currency)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">
              {formatCurrency(purchase.amountCents, purchase.currency)}
            </span>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/library/${purchase.course.slug}`} className="flex-1">
              <Button size="lg" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.print()}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
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
