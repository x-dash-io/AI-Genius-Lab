import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-semibold">
            SYNAPZE
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
            <Link href="/courses" className="hover:text-zinc-900">
              Courses
            </Link>
            <Link href="/dashboard" className="hover:text-zinc-900">
              Customer Portal
            </Link>
            <Link href="/sign-in" className="hover:text-zinc-900">
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
