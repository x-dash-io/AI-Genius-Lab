import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCoursePreviewBySlug } from "@/lib/courses";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder } from "@/lib/paypal";

type CheckoutPageProps = {
  searchParams?: { course?: string };
};

async function createCheckoutSession(formData: FormData) {
  "use server";

  const session = await auth();
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
    returnUrl: `${appUrl}/checkout/success?course=${course.slug}`,
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
  const session = await auth();
  const slug = searchParams?.course;
  if (!slug) {
    redirect("/courses");
  }

  const course = await getCoursePreviewBySlug(slug);
  if (!course) {
    redirect("/courses");
  }

  if (!session?.user) {
    return (
      <section className="grid gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Checkout</h1>
          <p className="mt-2 text-zinc-600">
            Sign in to purchase and unlock this course.
          </p>
        </div>
        <Link
          href="/sign-in"
          className="w-fit rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">Checkout</h1>
        <p className="mt-2 text-zinc-600">
          You are purchasing <strong>{course.title}</strong>.
        </p>
      </div>
      <form action={createCheckoutSession} className="grid gap-4">
        <input type="hidden" name="courseId" value={course.id} />
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Pay with PayPal · ${(course.priceCents / 100).toFixed(2)}
        </button>
      </form>
    </section>
  );
}
