"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface EmailChangeFormProps {
  currentEmail: string;
}

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"input" | "verify">("input");
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newEmail === currentEmail) {
      toast({
        title: "Same email",
        description: "Please enter a different email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/profile/email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send verification code");
      }

      setStep("verify");
      toast({
        title: "Verification code sent",
        description: `We've sent a verification code to ${newEmail}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to send code",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, code: verificationCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify code");
      }

      toast({
        title: "Email updated!",
        description: "Your email address has been successfully changed.",
        variant: "success",
      });

      // Reset form
      setStep("input");
      setNewEmail("");
      setVerificationCode("");
      
      // Refresh the page to show new email
      router.refresh();
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStep("input");
    setNewEmail("");
    setVerificationCode("");
  };

  if (step === "verify") {
    return (
      <form onSubmit={handleVerifyChange} className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            We've sent a 6-digit verification code to <strong>{newEmail}</strong>. 
            Please enter it below to confirm your email change.
          </p>
        </div>

        <FloatingInput
          id="verificationCode"
          type="text"
          label="Verification Code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          required
          disabled={isLoading}
          maxLength={6}
          pattern="[0-9]{6}"
          placeholder="000000"
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify & Update
              </>
            )}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestChange} className="space-y-4">
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          Current email: <strong>{currentEmail}</strong>
        </p>
      </div>

      <FloatingInput
        id="newEmail"
        type="email"
        label="New Email Address"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        required
        disabled={isLoading}
      />

      <Button
        type="submit"
        disabled={isLoading || !newEmail}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Code...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Send Verification Code
          </>
        )}
      </Button>
    </form>
  );
}
