"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "@/lib/toast";
import { useAdminPreview } from "@/components/admin/PreviewBanner";

interface ProfileFormProps {
  initialData: {
    name: string | null;
    bio: string | null;
  };
  updateProfileAction: (formData: FormData) => Promise<void>;
}

export function ProfileForm({ initialData, updateProfileAction }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAdminPreview } = useAdminPreview();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isAdminPreview) {
      toast({
        title: "Preview Mode",
        description: "Profile updates are disabled in admin preview mode.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      await updateProfileAction(formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "success",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample data for admin preview
  const displayData = isAdminPreview ? {
    name: "Sample Customer",
    bio: "This is a sample customer bio. In a real customer account, their personal bio would appear here.",
  } : initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={displayData.name || ""}
          placeholder="Your name"
          readOnly={isAdminPreview}
          className={isAdminPreview ? "bg-muted cursor-not-allowed" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={displayData.bio || ""}
          placeholder="Tell us about yourself..."
          rows={4}
          maxLength={500}
          readOnly={isAdminPreview}
          className={isAdminPreview ? "bg-muted cursor-not-allowed" : ""}
        />
        <p className="text-xs text-muted-foreground">
          {(displayData.bio || "").length}/500 characters
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting || isAdminPreview}>
        {isAdminPreview ? (
          <>
            <ShieldAlert className="h-4 w-4 mr-2" />
            Preview Only
          </>
        ) : isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
