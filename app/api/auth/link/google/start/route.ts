import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createCustomRateLimit } from "@/lib/rate-limit";
import {
  createGoogleLinkIntent,
  GOOGLE_LINK_INTENT_COOKIE,
  GOOGLE_LINK_INTENT_TTL_SECONDS,
  normalizeReturnTo,
} from "@/lib/google-link-intent";

const googleLinkStartRateLimit = createCustomRateLimit("google-link-start", 5, 60 * 60);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await googleLinkStartRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many link attempts. Please try again later." },
        { status: 429 }
      );
    }

    let body: {
      currentPassword?: unknown;
      returnTo?: unknown;
    } = {};

    try {
      body = (await request.json()) as {
        currentPassword?: unknown;
        returnTo?: unknown;
      };
    } catch {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    const returnTo = normalizeReturnTo(body.returnTo, "/profile");

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to link Google." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        Account: {
          where: { provider: "google" },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Google linking is available for password-based accounts only." },
        { status: 400 }
      );
    }

    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    if (user.Account.length > 0) {
      return NextResponse.json({ error: "Google account is already linked." }, { status: 409 });
    }

    const intentToken = createGoogleLinkIntent({
      userId: user.id,
      email: user.email,
      returnTo,
    });

    const cookieStore = cookies();
    cookieStore.set(GOOGLE_LINK_INTENT_COOKIE, intentToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: GOOGLE_LINK_INTENT_TTL_SECONDS,
      path: "/",
    });

    const callbackUrl = new URL(returnTo, request.nextUrl.origin);
    callbackUrl.searchParams.set("googleLink", "success");

    const signInUrl = new URL("/api/auth/signin/google", request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", callbackUrl.toString());

    return NextResponse.json({ redirectUrl: signInUrl.toString() });
  } catch (error) {
    console.error("Failed to start Google link flow:", error);
    return NextResponse.json(
      { error: "Unable to start Google linking right now. Please try again." },
      { status: 500 }
    );
  }
}
