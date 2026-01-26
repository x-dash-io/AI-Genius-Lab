import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserSubscription } from "@/lib/subscription";
import { SubscriptionPageClient } from "./SubscriptionPageClient";

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string; cancelled?: string; success?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;

  if (!session?.user) {
    const returnUrl = "/subscription";
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(returnUrl)}`);
  }

  const subscription = await getUserSubscription(session.user.id);

  return (
    <SubscriptionPageClient
      subscription={subscription}
      searchParams={resolvedSearchParams}
    />
  );
}
