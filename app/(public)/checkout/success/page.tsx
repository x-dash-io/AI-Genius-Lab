import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ course?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  return (
    <section className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Payment Submitted
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your PayPal payment is processing. Course access will unlock once the
          webhook confirms it.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <CardTitle>Payment Processing</CardTitle>
          </div>
          <CardDescription>
            You will receive an email confirmation once your payment is confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link
            href={resolvedSearchParams?.course ? `/library/${resolvedSearchParams.course}` : "/library"}
          >
            <Button size="lg" className="w-full">
              Go to Library
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" size="lg" className="w-full">
              Browse More Courses
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
