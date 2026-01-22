import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const activity = await prisma.activityLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Activity</h1>
        <p className="mt-2 text-zinc-400">
          Recent learning activity and purchase history will appear here.
        </p>
      </div>
      <div className="grid gap-3">
        {activity.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-200"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              {entry.type}
            </p>
            <p className="mt-2 text-zinc-300">
              {entry.createdAt.toLocaleString()}
            </p>
          </div>
        ))}
        {activity.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 p-5 text-sm text-zinc-400">
            Activity timeline and completion events coming soon.
          </div>
        ) : null}
      </div>
    </section>
  );
}
