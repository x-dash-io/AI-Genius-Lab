import { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User, Account } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma, withRetry } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { type Role } from "@/lib/rbac";

// Create a prisma instance with error handling for auth
const authPrisma = prisma;

// Use adapter only in non-production environments for resilience
const useAdapter = process.env.NODE_ENV !== "production" || process.env.USE_PRISMA_ADAPTER === "true";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email?.toString().toLowerCase().trim();
          const password = credentials?.password?.toString();

          if (!email || !password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isValid = await verifyPassword(password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: any;
      account: Account | null;
      profile?: any;
    }) {
      // For OAuth providers, handle account linking and role assignment
      if (account && account.provider !== "credentials" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { Account: true },
          });

          if (existingUser) {
            // Check if this OAuth account is already linked
            const existingAccount = existingUser.Account?.find(
              (acc) =>
                acc.provider === account.provider &&
                acc.providerAccountId === account.providerAccountId
            );

            if (!existingAccount) {
              // Link the OAuth account to existing user
              await prisma.account.create({
                data: {
                  id: crypto.randomUUID(),
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
            }

            // If user exists but has no role, set it to customer
            if (!existingUser.role) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: "customer" },
              });
            }

            // Update user info from OAuth profile if missing
            const picture = profile?.picture || profile?.image;
            if (!existingUser.image && picture) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { image: picture },
              });
            }
          } else {
            // New user - ensure they have a role
            if (user.id) {
              await prisma.user.update({
                where: { id: user.id },
                data: { role: "customer" },
              }).catch(() => {
                // User might not exist yet, adapter will create it
              });
            }
          }
        } catch (error) {
          console.error("SignIn callback error:", error);
          // Don't block sign-in if linking fails - adapter will handle it
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }: { token: JWT; user?: User; account?: Account | null; trigger?: string }) {
      // Initial sign in - user object is available
      if (user) {
        token.id = user.id;
        token.role = (user as User & { role?: Role }).role || "customer";
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.lastRefresh = Date.now();
        return token;
      }
      
      // For OAuth sign-in, the user.id from adapter might be different or missing
      // Fetch from DB using email to ensure we have the correct database user ID
      if (account && account.provider !== "credentials" && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, name: true, email: true, image: true, role: true },
          });
          
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role || "customer";
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.picture = dbUser.image;
            token.lastRefresh = Date.now();
            return token;
          }
        } catch (error) {
          console.error("Error fetching OAuth user:", error);
        }
      }
      
      // Refresh user data from DB periodically (every 1 minute) or on update trigger
      const REFRESH_INTERVAL = 1 * 60 * 1000; // 1 minute - more frequent to catch account switches and role changes
      const shouldRefresh = trigger === "update" || 
        !token.lastRefresh || 
        (Date.now() - (token.lastRefresh as number)) > REFRESH_INTERVAL;
      
      if (shouldRefresh && token.id) {
        try {
          // Use withRetry for database resilience in JWT callback
          const freshUser = await withRetry(() => prisma.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, name: true, email: true, image: true, role: true },
          }));
          
          if (freshUser) {
            // Check if email has changed - this indicates account switch
            // Use case-insensitive comparison for emails
            const tokenEmail = (token.email as string || "").toLowerCase().trim();
            const freshEmail = (freshUser.email || "").toLowerCase().trim();

            if (tokenEmail && freshEmail && tokenEmail !== freshEmail) {
              console.warn(`Email mismatch detected: ${tokenEmail} vs ${freshEmail} - invalidating token`);
              return {};
            }
            
            // Check if role has changed - critical for multi-device sync
            // If role changed, invalidate token to force re-authentication (security best practice)
            const roleChanged = token.role !== freshUser.role;
            if (roleChanged) {
              console.warn(`Role change detected in JWT callback: ${token.role} -> ${freshUser.role}. Invalidating token for security.`);
              // Return empty token to force re-authentication when role changes
              // This prevents privilege escalation attacks
              return {};
            }
            
            // Always update token with fresh data from database
            token.id = freshUser.id;
            token.name = freshUser.name;
            token.email = freshUser.email;
            token.picture = freshUser.image;
            token.role = freshUser.role;
            token.lastRefresh = Date.now();
          } else {
            // CRITICAL: User not found in database during periodic refresh.
            // To prevent accidental sign-outs due to transient database issues or eventual consistency,
            // we do NOT invalidate the token immediately. Instead, we keep the current session
            // and let the next refresh cycle (or a hard navigation) try again.
            // Only if the user is consistently missing will they eventually be logged out
            // when the token expires naturally or they try to perform an action that fails.
            console.warn(`[Auth] User ${token.id} not found in database during JWT refresh. Preserving session for resilience.`);
            return token;
          }
        } catch (error) {
          console.error("[Auth] Error refreshing user in JWT callback:", error);
          // On error, we prefer to keep the user logged in with the existing token
          // than to force a sign-out due to a transient database issue.
          // The next refresh attempt will try again.
          return token;
        }
      }
      
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Use cached data from JWT token instead of querying DB every time
      if (session.user && token && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) || "customer";
        session.user.name = token.name as string | null;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Redirect admins to admin dashboard after sign-in
      if (url.startsWith("/dashboard") || url === baseUrl || url === `${baseUrl}/`) {
        // We'll handle admin redirect in the dashboard page itself
        return url;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
};
