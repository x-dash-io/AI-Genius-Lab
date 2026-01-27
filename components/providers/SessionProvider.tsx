"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { Session } from "next-auth";

export function SessionProvider({ children, session }: { children: ReactNode, session: Session | null }) {
  return (
    <NextAuthSessionProvider
      session={session}
      refetchInterval={1 * 60} // Reduced from 5 minutes to 1 minute for better session sync
      refetchOnWindowFocus={true}
      refetchOnMount={true} // Always refetch on mount to ensure fresh session
    >
      {children}
    </NextAuthSessionProvider>
  );
}
