"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BackgroundBlobs } from "@/components/ui/background-blobs";

export function PublicLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <BackgroundBlobs />
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-4 pb-4 sm:px-6 sm:pt-5 sm:pb-5 lg:px-8 overflow-x-hidden">
          <div>
            <Link
              href="/"
              className="font-display text-xl font-bold tracking-tight"
            >
              SYNAPZE
            </Link>
          </div>
          <nav className="flex items-center gap-6 flex-wrap">
            <Link
              href="/courses"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Courses
            </Link>
            <ThemeToggle />
            {session?.user ? (
              <>
                <Separator orientation="vertical" className="h-6" />
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/library">
                  <Button variant="ghost" size="sm">
                    Library
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {session.user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-sm sm:block">
                    <p className="font-medium">{session.user.email}</p>
                  </div>
                  <SignOutButton />
                </div>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 relative z-10"
      >
        {children}
      </motion.main>
    </div>
  );
}
