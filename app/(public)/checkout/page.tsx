import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCoursePreviewBySlug } from "@/lib/courses";
import { prisma } from "@/lib/prisma";
import { getUserSubscription } from "@/lib/subscriptions";
import { createPayPalOrder } from "@/lib/paypal";
import { getCartFromCookies } from "@/lib/cart/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutCartForm } from "@/components/checkout/CheckoutCartForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  // PREMIUM courses can only be purchased by Pro/Elite subscribers
  if (course.tier === "PREMIUM") {
    const subscription = await getUserSubscription(session.user.id);
    const hasProAccess =
      subscription?.plan.tier === "pro" || subscription?.plan.tier === "elite";

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

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;
  const slug = resolvedSearchParams?.course;
  const itemsParam = resolvedSearchParams?.items;
  const checkoutStatus = resolvedSearchParams?.checkout;

  // Handle cart checkout (multiple items)
  if (itemsParam) {
    const courseIds = itemsParam.split(",").filter(Boolean);
    if (courseIds.length === 0) {
      redirect("/cart");
    }

    let cart;
    try {
      cart = await getCartFromCookies();
    } catch (error) {
      console.error("Error loading cart:", error);
      cart = { items: [], totalCents: 0, itemCount: 0 };
    }

    // Ensure cart has valid structure
    if (!cart || !cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
      redirect("/cart");
    }

    // Verify all items in cart match the requested items
    const requestedItems = cart.items.filter((item) =>
      courseIds.includes(item.courseId)
    );

    if (requestedItems.length === 0) {
      redirect("/cart");
    }

    if (!session?.user) {
      return (
        <section className="grid gap-8">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Checkout</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Sign in to complete your purchase.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to proceed with checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`/checkout?items=${itemsParam}`)}`}>
                <Button size="lg" className="w-full">
                  Sign in to purchase
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="outline" className="w-full">
                  Back to cart
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      );
    }

    return (
      <section className="grid gap-8">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Checkout</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Complete your purchase to unlock your courses.
          </p>
        </div>

        {checkoutStatus === "cancelled" && (
          <Alert variant="warning">
            <AlertDescription>
              Checkout was cancelled. You can try again when you're ready.
            </AlertDescription>
          </Alert>
        )}

        {checkoutStatus === "failed" && (
          <Alert variant="destructive">
            <AlertDescription>
              Payment failed. Please try again or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        )}

        <CheckoutCartForm items={requestedItems} />
      </section>
    );
  }

  // Handle single course checkout (legacy)
  if (!slug) {
    redirect("/courses");
  }

  const course = await getCoursePreviewBySlug(slug);
  if (!course) {
    redirect("/courses");
  }

  // PREMIUM courses can only be purchased by Pro/Elite subscribers
  if (course.tier === "PREMIUM") {
    const subscription = session?.user
      ? await getUserSubscription(session.user.id)
      : null;
    const hasProAccess =
      subscription?.plan.tier === "pro" || subscription?.plan.tier === "elite";

    if (!hasProAccess) {
      redirect(`/courses/${course.slug}?error=premium_only`);
    }
  }

  if (!session?.user) {
    const returnUrl = slug ? `/checkout?course=${slug}` : "/checkout";
    return (
      <section className="grid gap-8">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Checkout
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Sign in to purchase and unlock this course.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>
              {course.description ?? "Course details coming soon."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="text-2xl font-bold">
              ${(course.priceCents / 100).toFixed(2)}
            </div>
            <Link href={`/sign-in?callbackUrl=${encodeURIComponent(returnUrl)}`}>
              <Button size="lg" className="w-full">
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
      </section>
    );
  }

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Checkout
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Complete your purchase to unlock this course.
        </p>
      </div>

      {checkoutStatus === "cancelled" && (
        <Alert variant="warning">
          <AlertDescription>
            Checkout was cancelled. You can try again when you're ready.
          </AlertDescription>
        </Alert>
      )}

      {checkoutStatus === "failed" && (
        <Alert variant="destructive">
          <AlertDescription>
            Payment failed. Please try again or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          <CardDescription>
            {course.description ?? "Course details coming soon."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckoutForm
            courseId={course.id}
            courseTitle={course.title}
            priceCents={course.priceCents}
            createCheckoutSession={createCheckoutSession}
          />
          <Link href={`/courses/${course.slug}`} className="block mt-4">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
