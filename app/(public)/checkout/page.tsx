import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCoursePreviewBySlug } from "@/lib/courses";
import { prisma } from "@/lib/prisma";
import { getUserSubscription } from "@/lib/subscriptions";
import { createPayPalOrder } from "@/lib/paypal";
import { getCartFromCookies } from "@/lib/cart/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutCartForm } from "@/components/checkout/CheckoutCartForm";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
} from "@/components/layout/shell";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  searchParams: Promise<{ course?: string; items?: string; checkout?: string }>;
};

async function createCheckoutSession(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const courseId = String(formData.get("courseId") ?? "");
  if (!courseId) {
    redirect("/courses");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    redirect("/courses");
  }

  if (course.tier === "PREMIUM") {
    const subscription = await getUserSubscription(session.user.id);
    const hasProAccess =
      subscription?.plan.tier === "professional" || subscription?.plan.tier === "founder";

    if (!hasProAccess) {
      redirect(`/courses/${course.slug}?error=premium_only`);
    }
  }

  const existingPurchase = await prisma.purchase.findFirst({
    where: { userId: session.user.id, courseId: course.id },
  });

  if (existingPurchase?.status === "paid") {
    redirect(`/library/${course.slug}`);
  }

  const purchase =
    existingPurchase ??
    (await prisma.purchase.create({
      data: {
        id: `purchase_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: session.user.id,
        courseId: course.id,
        amountCents: course.priceCents,
        currency: "usd",
        status: "pending",
        provider: "paypal",
      },
    }));

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const { orderId, approvalUrl } = await createPayPalOrder({
    amountCents: course.priceCents,
    currency: "usd",
    returnUrl: `${appUrl}/api/payments/paypal/capture`,
    cancelUrl: `${appUrl}/courses/${course.slug}?checkout=cancelled`,
    purchaseId: purchase.id,
  });

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { providerRef: orderId },
  });

  redirect(approvalUrl ?? `${appUrl}/courses/${course.slug}`);
}

function CheckoutStatusAlerts({ checkoutStatus }: { checkoutStatus?: string }) {
  return (
    <>
      {checkoutStatus === "cancelled" ? (
        <Alert variant="warning">
          <AlertDescription>Checkout was cancelled. You can retry at any time.</AlertDescription>
        </Alert>
      ) : null}

      {checkoutStatus === "failed" ? (
        <Alert variant="destructive">
          <AlertDescription>Payment failed. Retry checkout or contact support.</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;
  const slug = resolvedSearchParams?.course;
  const itemsParam = resolvedSearchParams?.items;
  const checkoutStatus = resolvedSearchParams?.checkout;

  if (itemsParam) {
    const courseIds = itemsParam.split(",").filter(Boolean);
    if (!courseIds.length) {
      redirect("/cart");
    }

    let cart;
    try {
      cart = await getCartFromCookies();
    } catch (error) {
      console.error("Error loading cart:", error);
      cart = { items: [], totalCents: 0, itemCount: 0 };
    }

    if (!cart || !cart.items || !Array.isArray(cart.items) || !cart.items.length) {
      redirect("/cart");
    }

    const requestedItems = cart.items.filter((item) => courseIds.includes(item.courseId));
    if (!requestedItems.length) {
      redirect("/cart");
    }

    return (
      <PageContainer className="space-y-6">
        <PageHeader
          title="Checkout"
          description="Confirm your selected courses and complete payment."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />

        <StatusRegion>
          <CheckoutStatusAlerts checkoutStatus={checkoutStatus} />
        </StatusRegion>

        <ContentRegion>
          {!session?.user ? (
            <Card className="ui-surface">
              <CardHeader>
                <CardTitle>Sign in required</CardTitle>
                <CardDescription>Sign in to continue with checkout.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`/checkout?items=${itemsParam}`)}`}>
                  <Button variant="premium" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="outline" className="w-full">
                    Back to Cart
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <CheckoutCartForm
              items={requestedItems}
              couponCode={cart.couponCode}
              discountAmount={cart.discountTotal}
            />
          )}
        </ContentRegion>
      </PageContainer>
    );
  }

  if (!slug) {
    redirect("/courses");
  }

  const course = await getCoursePreviewBySlug(slug);
  if (!course) {
    redirect("/courses");
  }

  if (course.tier === "PREMIUM") {
    const subscription = session?.user ? await getUserSubscription(session.user.id) : null;
    const hasProAccess =
      subscription?.plan.tier === "professional" || subscription?.plan.tier === "founder";

    if (!hasProAccess) {
      redirect(`/courses/${course.slug}?error=premium_only`);
    }
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Checkout"
        description="Complete purchase and unlock access."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Courses", href: "/courses" },
          { label: "Checkout" },
        ]}
      />

      <StatusRegion>
        <CheckoutStatusAlerts checkoutStatus={checkoutStatus} />
      </StatusRegion>

      <ContentRegion>
        {!session?.user ? (
          <Card className="ui-surface">
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>{course.description ?? "Course details coming soon."}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <p className="text-2xl font-semibold">${(course.priceCents / 100).toFixed(2)}</p>
              <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`/checkout?course=${slug}`)}`}>
                <Button variant="premium" className="w-full">
                  Sign in to purchase
                </Button>
              </Link>
              <Link href={`/courses/${course.slug}`}>
                <Button variant="outline" className="w-full">
                  Back to course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
            <Card className="ui-surface">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description ?? "Course details coming soon."}</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckoutForm
                  courseId={course.id}
                  courseTitle={course.title}
                  priceCents={course.priceCents}
                  createCheckoutSession={createCheckoutSession}
                />
              </CardContent>
            </Card>

            <Card className="ui-surface">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Single course purchase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Course</span>
                  <span className="font-semibold">{course.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">${(course.priceCents / 100).toFixed(2)}</span>
                </div>
                <Link href={`/courses/${course.slug}`} className="block pt-2">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </ContentRegion>
    </PageContainer>
  );
}

