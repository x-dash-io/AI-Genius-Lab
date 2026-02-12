"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import {
  AlertCircle,
  BadgeCheck,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

import { AuthCard, AuthHelpAccordion, type AuthStep } from "@/components/auth/AuthCard";
import { GoogleLogoIcon } from "@/components/auth/GoogleLogoIcon";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { OTPInput } from "@/components/auth/OTPInput";
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

const SIGN_UP_STEPS: AuthStep[] = [
  {
    id: "form",
    label: "Account details",
  },
  {
    id: "otp",
    label: "Verify email",
  },
];

const SIGN_UP_CHIPS = [
  {
    icon: ShieldCheck,
    label: "Secure account",
  },
  {
    icon: BadgeCheck,
    label: "OTP verification",
  },
  {
    icon: MailCheck,
    label: "Instant onboarding",
  },
] as const;

export default function SignUpPage() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    if (status === "authenticated" && (session as SessionData | null)?.user) {
      const currentRole = (session as SessionData | null)?.user?.role;
      const redirectUrl = currentRole === "admin" ? "/admin" : callbackUrl;
      router.replace(redirectUrl);
    }
  }, [status, session, router, callbackUrl]);

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const emailValue = String(formData.get("email") ?? "");
    const passwordValue = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const nameValue = String(formData.get("name") ?? "").trim();

    if (!nameValue) {
      setError("Name is required.");
      setIsLoading(false);
      return;
    }

    if (passwordValue !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (passwordValue.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    setEmail(emailValue);
    setName(nameValue);
    setPassword(passwordValue);

    setIsSendingOTP(true);

    try {
      const otpResponse = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailValue, purpose: "signup" }),
      });

      if (!otpResponse.ok) {
        const otpData = await otpResponse.json();
        setError(otpData.error || "Failed to send verification code.");
        setIsLoading(false);
        setIsSendingOTP(false);
        return;
      }

      setIsLoading(false);
      setIsSendingOTP(false);
      setStep("otp");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
      setIsSendingOTP(false);
    }
  }

  async function handleOTPSubmit() {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setError(null);
    setIsVerifyingOTP(true);

    try {
      const verifyResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyData.error || "Invalid verification code.");
        setIsVerifyingOTP(false);
        return;
      }

      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        setError(signupData.error || "Failed to create account.");
        setIsVerifyingOTP(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Account created but sign-in failed. Please try signing in.");
        setIsVerifyingOTP(false);
        return;
      }

      setIsVerifyingOTP(false);
      setIsRedirecting(true);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsVerifyingOTP(false);
    }
  }

  async function handleResendOTP() {
    setError(null);
    setIsSendingOTP(true);
    setOtp("");

    try {
      const otpResponse = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, purpose: "signup" }),
      });

      if (!otpResponse.ok) {
        const otpData = await otpResponse.json();
        setError(otpData.error || "Failed to resend verification code.");
      }
    } catch {
      setError("Failed to resend verification code.");
    } finally {
      setIsSendingOTP(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setIsGoogleLoading(true);

    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("Failed to sign up with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  }

  const isBusy = isLoading || isGoogleLoading || isRedirecting || isSendingOTP;

  return (
    <AuthPageLayout>
      <AuthCard
        title={step === "form" ? "Create your account" : "Verify your email"}
        description={
          step === "form"
            ? "Set up your account to unlock purchases, progress tracking, and certificates."
            : `Enter the six-digit verification code sent to ${email}.`
        }
        steps={SIGN_UP_STEPS}
        currentStepId={isRedirecting ? "otp" : step}
        chips={SIGN_UP_CHIPS}
      >
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
              text={status === "loading" ? "Checking your account status..." : "Creating your first session..."}
            />
          </div>
        ) : step === "otp" ? (
          <>
            <div className="rounded-[var(--radius-sm)] border bg-background/80 px-3 py-2 text-xs text-muted-foreground">
              We&apos;ll email a 6-digit code to verify your address before activating the account.
            </div>

            <OTPInput value={otp} onChange={setOtp} disabled={isVerifyingOTP || isSendingOTP} />

            <Button
              type="button"
              variant="premium"
              className="h-11 w-full"
              onClick={handleOTPSubmit}
              disabled={otp.length !== 6 || isVerifyingOTP}
            >
              {isVerifyingOTP ? (
                <span className="flex items-center gap-2">
                  <Loader size="sm" inline />
                  Verifying code...
                </span>
              ) : (
                "Verify and create account"
              )}
            </Button>

            <details className="group rounded-[var(--radius-md)] border bg-background/88 p-3">
              <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium marker:content-none">
                Need help?
                <span className="text-muted-foreground">{isSendingOTP ? "Sending..." : "Open"}</span>
              </summary>
              <div className="mt-3 grid gap-2 border-t pt-3 text-sm">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isSendingOTP || isVerifyingOTP}
                  className="inline-flex min-h-10 items-center justify-start rounded-[var(--radius-sm)] px-2 py-2 font-medium text-primary hover:bg-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSendingOTP ? "Sending verification code..." : "Resend verification code"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                    setError(null);
                  }}
                  disabled={isVerifyingOTP || isSendingOTP}
                  className="inline-flex min-h-10 items-center justify-start rounded-[var(--radius-sm)] px-2 py-2 font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Edit account details
                </button>
                <Link
                  href="mailto:support@aigeniuslab.com"
                  className="inline-flex min-h-10 items-center rounded-[var(--radius-sm)] px-2 py-2 font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                >
                  Contact support
                </Link>
              </div>
            </details>
          </>
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

            <form className="grid gap-4" onSubmit={handleFormSubmit}>
              <div className="grid gap-2">
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Full name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className="h-11 border-input/85 bg-background/90 text-sm shadow-[inset_0_1px_0_hsl(var(--background)),var(--shadow-sm)] focus-visible:border-primary/60 focus-visible:ring-primary/30"
                  disabled={isBusy}
                />
              </div>

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
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                hint="Use at least 8 characters with a mix of letters and numbers."
                disabled={isBusy}
              />

              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                disabled={isBusy}
              />

              <div className="rounded-[var(--radius-sm)] border bg-background/80 px-3 py-2 text-xs text-muted-foreground">
                We&apos;ll email a 6-digit code to verify your address.
              </div>

              <Button type="submit" variant="premium" className="h-11 w-full" disabled={isBusy}>
                {isLoading || isSendingOTP ? (
                  <span className="flex items-center gap-2">
                    <Loader size="sm" inline />
                    Sending verification code...
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>

            <AuthHelpAccordion
              items={[
                { label: "Reset password", href: "/forgot-password", variant: "primary" },
                { label: "Already have an account? Sign in", href: "/sign-in", variant: "secondary" },
                { label: "Contact support", href: "mailto:support@aigeniuslab.com", variant: "secondary" },
              ]}
            />
          </>
        )}
      </AuthCard>
    </AuthPageLayout>
  );
}
