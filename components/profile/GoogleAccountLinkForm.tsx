"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleLogoIcon } from "@/components/auth/GoogleLogoIcon";
import { toast } from "@/lib/toast";
import { Loader2, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { useAdminPreview } from "@/components/admin/PreviewBanner";

type LinkStatus =
  | "success"
  | "verification_failed"
  | "email_mismatch"
  | "already_in_use"
  | "failed"
  | undefined;

interface GoogleAccountLinkFormProps {
  isLinked: boolean;
  hasPassword: boolean;
  currentEmail: string;
  returnTo: string;
  linkStatus?: string;
}

function renderStatusAlert(status: LinkStatus) {
  switch (status) {
    case "success":
      return (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Google account linked successfully.</AlertDescription>
        </Alert>
      );
    case "verification_failed":
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Google email must be verified before linking.</AlertDescription>
        </Alert>
      );
    case "email_mismatch":
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Google email did not match your account email. Sign in with the matching Google account to link.
          </AlertDescription>
        </Alert>
      );
    case "already_in_use":
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This Google account is already linked to a different user.
          </AlertDescription>
        </Alert>
      );
    case "failed":
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Google linking failed. Please try again.</AlertDescription>
        </Alert>
      );
    default:
      return null;
  }
}

export function GoogleAccountLinkForm({
  isLinked,
  hasPassword,
  currentEmail,
  returnTo,
  linkStatus,
}: GoogleAccountLinkFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAdminPreview } = useAdminPreview();

  const handleLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isAdminPreview) {
      toast({
        title: "Preview mode",
        description: "Google linking is disabled in admin preview mode.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/link/google/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          returnTo,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        redirectUrl?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to start Google linking");
      }

      if (!payload.redirectUrl) {
        throw new Error("Missing OAuth redirect URL");
      }

      window.location.assign(payload.redirectUrl);
    } catch (error) {
      toast({
        title: "Link failed",
        description: error instanceof Error ? error.message : "Unable to start linking flow",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {renderStatusAlert(linkStatus as LinkStatus)}

      <Alert>
        <GoogleLogoIcon className="h-4 w-4" />
        <AlertDescription>
          Account email: <strong>{currentEmail}</strong>
        </AlertDescription>
      </Alert>

      {isLinked ? (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Google sign-in is already enabled for your account.</AlertDescription>
        </Alert>
      ) : !hasPassword ? (
        <Alert variant="warning">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            This flow is available for password-based accounts. Add a password first, then link Google.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPasswordLink">Confirm current password</Label>
            <Input
              id="currentPasswordLink"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter your current password"
              required
              disabled={isSubmitting || isAdminPreview}
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isSubmitting || isAdminPreview || currentPassword.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Google...
              </>
            ) : (
              <>
                <GoogleLogoIcon className="mr-2" />
                Link Google Account
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
