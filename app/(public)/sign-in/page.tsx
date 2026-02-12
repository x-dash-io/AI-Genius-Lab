"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { AlertCircle, CheckCircle2, ShieldCheck, WalletCards } from "lucide-react";

import { AuthCard, AuthHelpAccordion } from "@/components/auth/AuthCard";
import { GoogleLogoIcon } from "@/components/auth/GoogleLogoIcon";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { PasswordField } from "@/components/auth/PasswordField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";

interface SessionUser {
  role?: string;
}

interface SessionData {
  user?: SessionUser;
}

const SIGN_IN_CHIPS = [
  {
    icon: ShieldCheck,
    label: "Secure payments",
  },
  {
    icon: WalletCards,
    label: "Progress tracking",
  },
  {
    icon: CheckCircle2,
    label: "Certificates",
  },
] as const;

export default function SignInPage() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const resetStatus = searchParams?.get("reset");
  const showResetSuccess = resetStatus === "success";

  useEffect(() => {
    if (status === "authenticated" && (session as SessionData | null)?.user) {
      const currentRole = (session as SessionData | null)?.user?.role;
      const redirectUrl = currentRole === "admin" ? "/admin" : callbackUrl;
      router.replace(redirectUrl);
    }
  }, [status, session, router, callbackUrl]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const signInPromise = signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Sign in timeout")), 10000);
      });

      const result = await Promise.race([signInPromise, timeoutPromise]);

      if (!result || result.error) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      if (result.ok) {
        setIsLoading(false);
        setIsRedirecting(true);
        router.refresh();
        return;
      }

      setError("Sign in failed. Please try again.");
      setIsLoading(false);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message === "Sign in timeout") {
        setError("Sign in is taking too long. Check your network and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setIsGoogleLoading(true);

    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  }

  const isBusy = isLoading || isGoogleLoading || isRedirecting;

  return (
    <AuthPageLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to continue to your courses, billing, and learning progress."
        chips={SIGN_IN_CHIPS}
      >
        {showResetSuccess ? (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Password reset successful. Sign in with your new password.</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {status === "loading" || status === "authenticated" || isRedirecting ? (
          <div className="rounded-[var(--radius-md)] border bg-background/85 p-5">
            <Loader
              size="md"
              text={status === "loading" ? "Checking your account status..." : "Opening your workspace..."}
            />
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={handleGoogleSignIn}
              disabled={isBusy}
            >
              {isGoogleLoading ? (
                <span className="flex items-center gap-2">
                  <Loader size="sm" inline />
                  Connecting to Google...
                </span>
              ) : (
                <>
                  <GoogleLogoIcon />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Or
              </span>
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 border-input/85 bg-background/90 text-sm shadow-[inset_0_1px_0_hsl(var(--background)),var(--shadow-sm)] focus-visible:border-primary/60 focus-visible:ring-primary/30"
                  disabled={isBusy}
                />
              </div>

              <PasswordField
                id="password"
                name="password"
                label="Password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                disabled={isBusy}
              />

              <Button type="submit" variant="premium" className="h-11 w-full" disabled={isBusy}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader size="sm" inline />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link href="/forgot-password" className="font-medium text-primary underline-offset-4 hover:underline">
                  Forgot password
                </Link>
                <Link href="/sign-up" className="font-medium text-primary underline-offset-4 hover:underline">
                  Create account
                </Link>
              </div>
            </form>

            <AuthHelpAccordion
              items={[
                { label: "Reset password", href: "/forgot-password", variant: "primary" },
                { label: "Create a new account", href: "/sign-up", variant: "secondary" },
                { label: "Contact support", href: "mailto:support@aigeniuslab.com", variant: "secondary" },
              ]}
            />
          </>
        )}
      </AuthCard>
    </AuthPageLayout>
  );
}
