"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, User, ShieldAlert } from "lucide-react";
import { toast } from "@/lib/toast";
import { useAdminPreview } from "@/components/admin/PreviewBanner";

interface ProfileAvatarProps {
  currentImage: string | null;
  userEmail: string;
  userName: string | null;
  onAvatarUpdate: (imageUrl: string) => Promise<void>;
}

export function ProfileAvatar({
  currentImage,
  userEmail,
  userName,
  onAvatarUpdate,
}: ProfileAvatarProps) {
  const router = useRouter();
  const { isAdminPreview } = useAdminPreview();
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImage);

  // Use sample name for preview
  const displayName = isAdminPreview ? "Sample Customer" : userName;
  const displayEmail = isAdminPreview ? "customer@example.com" : userEmail;

  // Sync imageUrl when currentImage prop changes (e.g., after page refresh)
  useEffect(() => {
    setImageUrl(currentImage);
  }, [currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAdminPreview) {
      toast({
        title: "Preview Mode",
        description: "Avatar uploads are disabled in admin preview mode.",
        variant: "destructive",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload via our API endpoint (allows customers to upload avatars)
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      const newImageUrl = data.secureUrl;
      
      // Update local state immediately for instant feedback
      setImageUrl(newImageUrl);
      
      // Update on server
      await onAvatarUpdate(newImageUrl);

      // Refresh the page to get updated data
      router.refresh();

      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
        variant: "success",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload avatar";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  // Get initials from name first, fallback to email
  const getInitials = () => {
    const name = displayName;
    const email = displayEmail;
    if (name && name.trim()) {
      const nameParts = name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        // First letter of first name + first letter of last name
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
        // First two letters if single name
        return nameParts[0].substring(0, 2).toUpperCase();
      } else if (nameParts[0].length === 1) {
        // Single character name, use it twice
        return (nameParts[0] + nameParts[0]).toUpperCase();
      }
    }
    // Fallback to email
    return email.charAt(0).toUpperCase();
  };

  const initials = getInitials();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className={`h-24 w-24 border-2 transition-all ${
          isUploading 
            ? 'border-primary animate-pulse' 
            : 'border-border/50'
        }`}>
          <AvatarImage src={isAdminPreview ? undefined : (imageUrl || undefined)} alt={displayName || displayEmail} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        )}
      </div>
      <div className="relative">
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading || isAdminPreview}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("avatar-upload")?.click()}
          disabled={isUploading || isAdminPreview}
        >
          {isAdminPreview ? (
            <>
              <ShieldAlert className="h-4 w-4 mr-2" />
              Preview Only
            </>
          ) : isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Change Avatar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
