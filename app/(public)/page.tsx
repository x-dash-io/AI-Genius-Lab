import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="grid gap-10">
      <div className="grid gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
          AI Courses E-commerce Platform
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Learn AI with structured paths, verified access, and real outcomes.
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600">
          Synapze combines premium AI learning with secure commerce. Buy a
          course, unlock the full path, and track progress across every lesson.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/courses"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Browse courses
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900"
        >
          Learner dashboard
        </Link>
      </div>
      <div className="grid gap-4 rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600">
        <p>What ships in the MVP:</p>
        <ul className="grid gap-2">
          <li>Secure login, pay-gated course access, and progress tracking.</li>
          <li>Stripe checkout and verified webhook-based course grants.</li>
          <li>Course catalog, learner library, and lesson viewer scaffolding.</li>
        </ul>
      </div>
    </section>
  );
}
