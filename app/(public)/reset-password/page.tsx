"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

import { AuthCard, AuthHelpAccordion, type AuthStep } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { OTPInput } from "@/components/auth/OTPInput";
import { PasswordField } from "@/components/auth/PasswordField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";

const RESET_STEPS: AuthStep[] = [
  {
    id: "email",
    label: "Request code",
  },
  {
    id: "code",
    label: "Verify code",
  },
  {
    id: "password",
    label: "Set password",
  },
];

const RESET_CHIPS = [
  {
    icon: ShieldCheck,
    label: "Verified recovery",
  },
  {
    icon: CheckCircle2,
    label: "Secure reset",
  },
] as const;

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"email" | "code" | "password">("email");

  const router = useRouter();

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to send reset code.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setStep("code");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  async function handleCodeVerify() {
    if (resetCode.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setError(null);
    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: resetCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid or expired reset code.");
        setIsVerifying(false);
        return;
      }

      setIsVerifying(false);
      setStep("password");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsVerifying(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: resetCode, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      setTimeout(() => {
        router.push("/sign-in?reset=success");
      }, 2000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <AuthPageLayout>
      <AuthCard
        title={
          success
            ? "Password updated"
            : step === "email"
              ? "Reset password"
              : step === "code"
                ? "Verify reset code"
                : "Create a new password"
        }
        description={
          success
            ? "You can now sign in with your new credentials."
            : step === "email"
              ? "Enter your account email to request a secure reset code."
              : step === "code"
                ? `Enter the six-digit code sent to ${email}.`
                : "Set a new password to finish account recovery."
        }
        steps={RESET_STEPS}
        currentStepId={success ? "password" : step}
        chips={RESET_CHIPS}
      >
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {success ? (
          <>
            <div className="flex items-center justify-center rounded-[var(--radius-md)] border bg-background/85 p-5">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <div className="rounded-[var(--radius-md)] border bg-background/85 p-4 text-sm text-muted-foreground">
              Redirecting to sign in. If nothing happens, use the button below.
            </div>
            <Link href="/sign-in" className="block">
              <Button className="h-11 w-full" variant="outline">
                Go to sign in
              </Button>
            </Link>
          </>
        ) : step === "email" ? (
          <>
            <form className="grid gap-4" onSubmit={handleEmailSubmit}>
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
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" variant="premium" className="h-11 w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader size="sm" inline />
                    Sending code...
                  </span>
                ) : (
                  "Send reset code"
                )}
              </Button>

              <Link href="/sign-in" className="block">
                <Button variant="outline" className="h-11 w-full" type="button">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </form>

            <AuthHelpAccordion
              items={[
                { label: "Need a new code? Request again", href: "/forgot-password", variant: "primary" },
                { label: "Create a new account", href: "/sign-up", variant: "secondary" },
                { label: "Contact support", href: "mailto:support@aigeniuslab.com", variant: "secondary" },
              ]}
            />
          </>
        ) : step === "code" ? (
          <>
            <div className="rounded-[var(--radius-sm)] border bg-background/80 px-3 py-2 text-xs text-muted-foreground">
              We&apos;ll verify this code before unlocking password update.
            </div>
            <OTPInput value={resetCode} onChange={setResetCode} disabled={isVerifying} />

            <Button
              type="button"
              variant="premium"
              className="h-11 w-full"
              onClick={handleCodeVerify}
              disabled={resetCode.length !== 6 || isVerifying}
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <Loader size="sm" inline />
                  Verifying code...
                </span>
              ) : (
                "Verify code"
              )}
            </Button>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => {
                  setStep("email");
                  setResetCode("");
                  setError(null);
                }}
                disabled={isVerifying}
              >
                Edit email
              </Button>
              <Link href="/forgot-password" className="block">
                <Button type="button" variant="ghost" className="h-11 w-full">
                  Request new code
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <form className="grid gap-4" onSubmit={handlePasswordSubmit}>
              <PasswordField
                id="password"
                name="password"
                label="New password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                disabled={isLoading}
              />

              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                disabled={isLoading}
              />

              <Button type="submit" variant="premium" className="h-11 w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader size="sm" inline />
                    Resetting password...
                  </span>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>

            <AuthHelpAccordion
              items={[
                { label: "Start recovery again", href: "/forgot-password", variant: "primary" },
                { label: "Back to sign in", href: "/sign-in", variant: "secondary" },
                { label: "Contact support", href: "mailto:support@aigeniuslab.com", variant: "secondary" },
              ]}
            />
          </>
        )}
      </AuthCard>
    </AuthPageLayout>
  );
}
