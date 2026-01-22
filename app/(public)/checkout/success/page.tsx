import Link from "next/link";

type CheckoutSuccessPageProps = {
  searchParams?: { course?: string };
};

export default function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">
          Payment submitted
        </h1>
        <p className="mt-2 text-zinc-600">
          Your PayPal payment is processing. Course access will unlock once the
          webhook confirms it.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href={searchParams?.course ? `/library/${searchParams.course}` : "/library"}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Go to library
        </Link>
        <Link
          href="/courses"
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-900"
        >
          Browse courses
        </Link>
      </div>
    </section>
  );
}
