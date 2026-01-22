import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { type Role } from "@/lib/rbac";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, ensure new users get customer role
      if (account?.provider !== "credentials" && user.email) {
        try {
          console.log("OAuth sign-in for:", user.email);
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            console.log("Existing user found:", existingUser.id, "Role:", existingUser.role);
            // If user exists but has no role, set it to customer
            if (!existingUser.role) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: "customer" },
              });
              console.log("Updated user role to customer");
            }
          } else {
            console.log("New OAuth user - PrismaAdapter will create it");
          }
        } catch (error) {
          console.error("SignIn callback error:", error);
          // Don't block sign-in if role update fails
        }
      }
      // For credentials provider, user is already authenticated by authorize function
      return true;
    },
    async jwt({ token, user }) {
      // Initial sign in - user object is available
      if (user) {
        token.id = user.id;
        // For credentials provider, role comes from authorize function
        // For OAuth, PrismaAdapter will create user with default role from schema
        token.role = (user as any).role || "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) || "customer";
        
        // Fetch user data from database to get latest image and name
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, email: true, image: true },
          });
          
          if (user) {
            session.user.name = user.name;
            session.user.email = user.email;
            session.user.image = user.image;
          }
        } catch (error) {
          console.error("Error fetching user in session callback:", error);
          // Continue with existing session data if fetch fails
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
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
