import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCoursePreviewBySlug } from "@/lib/courses";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder } from "@/lib/paypal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CheckoutPageProps = {
  searchParams: Promise<{ course?: string }>;
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
  if (!slug) {
    redirect("/courses");
  }

  const course = await getCoursePreviewBySlug(slug);
  if (!course) {
    redirect("/courses");
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
      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          <CardDescription>
            {course.description ?? "Course details coming soon."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCheckoutSession} className="grid gap-4">
            <input type="hidden" name="courseId" value={course.id} />
            <div className="flex items-baseline justify-between border-t pt-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">
                ${(course.priceCents / 100).toFixed(2)}
              </span>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Pay with PayPal · ${(course.priceCents / 100).toFixed(2)}
            </Button>
            <Link href={`/courses/${course.slug}`}>
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
