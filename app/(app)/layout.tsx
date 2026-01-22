import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl">
        <aside className="hidden w-60 flex-col gap-6 border-r border-zinc-800 px-6 py-10 md:flex">
          <Link href="/dashboard" className="text-lg font-semibold">
            SYNAPZE
          </Link>
          <nav className="grid gap-3 text-sm text-zinc-300">
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <Link href="/library" className="hover:text-white">
              My Courses
            </Link>
            <Link href="/activity" className="hover:text-white">
              Activity
            </Link>
          </nav>
        </aside>
        <main className="flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
