import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User, Account } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma, withRetry } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { type Role } from "@/lib/rbac";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
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
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      // For OAuth providers, ensure new users get customer role
      if (account?.provider !== "credentials" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            // If user exists but has no role, set it to customer
            if (!existingUser.role) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: "customer" },
              });
            }
          }
        } catch (error) {
          console.error("SignIn callback error:", error);
          // Don't block sign-in if role update fails
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
      }
      
      // For OAuth sign-in, the user.id from adapter might be different or missing
      // Fetch from DB using email to ensure we have the correct database user ID
      if (account && account.provider !== "credentials" && token.email && !token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, name: true, email: true, image: true, role: true },
          });
          
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role || "customer";
            token.name = dbUser.name;
            token.picture = dbUser.image;
            token.lastRefresh = Date.now();
          }
        } catch (error) {
          console.error("Error fetching OAuth user:", error);
        }
      }
      
      // Refresh user data from DB periodically (every 5 minutes) or on update trigger
      const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
      const shouldRefresh = trigger === "update" || 
        !token.lastRefresh || 
        (Date.now() - (token.lastRefresh as number)) > REFRESH_INTERVAL;
      
      if (shouldRefresh && token.id) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, email: true, image: true, role: true },
          });
          
          if (freshUser) {
            token.name = freshUser.name;
            token.email = freshUser.email;
            token.picture = freshUser.image;
            token.role = freshUser.role;
            token.lastRefresh = Date.now();
          }
        } catch (error) {
          console.error("Error refreshing user in JWT callback:", error);
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

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
