"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface PasswordChangeFormProps {
  changePasswordAction: (formData: FormData) => Promise<void>;
}

export function PasswordChangeForm({ changePasswordAction }: PasswordChangeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Client-side validation
    if (newPassword.length < 8) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await changePasswordAction(formData);
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
        variant: "success",
      });
      e.currentTarget.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      toast({
        title: "Change failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type={showPasswords ? "text" : "password"}
          required
          placeholder="Enter current password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type={showPasswords ? "text" : "password"}
          required
          placeholder="Enter new password (min 8 characters)"
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showPasswords ? "text" : "password"}
          required
          placeholder="Confirm new password"
          minLength={8}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showPasswords"
          checked={showPasswords}
          onChange={(e) => setShowPasswords(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="showPasswords" className="text-sm font-normal cursor-pointer">
          Show passwords
        </Label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Changing...
          </>
        ) : (
          "Change Password"
        )}
      </Button>
    </form>
  );
}
