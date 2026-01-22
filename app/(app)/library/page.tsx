import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const purchases = await prisma.purchase.findMany({
    where: {
      userId: session.user.id,
      status: "paid",
    },
    include: {
      course: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">My Courses</h1>
        <p className="mt-2 text-zinc-400">
          Purchased courses appear here with progress and resume actions.
        </p>
      </div>
      <div className="grid gap-4">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Purchased
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                {purchase.course.title}
              </h2>
            </div>
            <Link
              href={`/library/${purchase.course.slug}`}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              Resume
            </Link>
          </div>
        ))}
        {purchases.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 p-5 text-sm text-zinc-400">
            No purchases yet. Complete checkout to unlock your course library.
          </div>
        ) : null}
      </div>
    </section>
  );
}
