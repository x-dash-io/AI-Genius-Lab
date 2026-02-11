"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck, ShieldCheck, TimerReset } from "lucide-react";

import { AuthCard, AuthHelpAccordion } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";

const FORGOT_CHIPS = [
  {
    icon: MailCheck,
    label: "6-digit reset code",
  },
  {
    icon: ShieldCheck,
    label: "Secure verification",
  },
  {
    icon: TimerReset,
    label: "Fast recovery",
  },
] as const;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send password reset email.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <AuthPageLayout>
      <AuthCard
        title={success ? "Check your inbox" : "Forgot password"}
        description={
          success
            ? "If your email exists, a reset code has been sent."
            : "Enter your account email and we&apos;ll send a secure 6-digit reset code."
        }
        chips={FORGOT_CHIPS}
      >
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {success ? (
          <>
            <div className="rounded-[var(--radius-md)] border bg-background/85 p-4 text-sm text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{email}</span>, your reset code will arrive shortly.
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/reset-password" className="block">
                <Button className="h-11 w-full" variant="premium">
                  Continue to reset
                </Button>
              </Link>
              <Link href="/sign-in" className="block">
                <Button className="h-11 w-full" variant="outline">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
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
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" variant="premium" className="h-11 w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader size="sm" inline />
                    Sending reset code...
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
                { label: "Go to reset password", href: "/reset-password", variant: "primary" },
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
