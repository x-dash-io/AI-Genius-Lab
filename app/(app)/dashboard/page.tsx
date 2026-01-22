import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const [purchaseCount, lastProgress] = await Promise.all([
    prisma.purchase.count({
      where: { userId: session.user.id, status: "paid" },
    }),
    prisma.progress.findFirst({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { lesson: true },
    }),
  ]);

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Learner Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Welcome back to Synapze.
        </h1>
        <p className="mt-2 text-zinc-400">
          Resume learning and track your progress across purchased courses.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-400">Courses purchased</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            {purchaseCount}
          </h2>
          <Link href="/library" className="mt-4 inline-flex text-sm text-white">
            View library →
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-400">Last activity</p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            {lastProgress?.lesson.title ?? "No activity yet"}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {lastProgress?.updatedAt
              ? `Updated ${lastProgress.updatedAt.toLocaleDateString()}`
              : "Complete a lesson to see progress here."}
          </p>
        </div>
      </div>
    </section>
  );
}
