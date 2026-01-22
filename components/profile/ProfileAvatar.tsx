"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, User } from "lucide-react";
import { toast } from "@/lib/toast";

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
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImage);

  // Sync imageUrl when currentImage prop changes (e.g., after page refresh)
  useEffect(() => {
    setImageUrl(currentImage);
  }, [currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (userName && userName.trim()) {
      const nameParts = userName.trim().split(/\s+/);
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
    return userEmail.charAt(0).toUpperCase();
  };

  const initials = getInitials();

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24 ring-4 ring-primary ring-offset-2 ring-offset-card">
        <AvatarImage src={imageUrl || undefined} alt={userName || userEmail} />
        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="relative">
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("avatar-upload")?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
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
