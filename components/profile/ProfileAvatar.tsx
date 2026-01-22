"use client";

import { useState } from "react";
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
  const [isUploading, setIsUploading] = useState(false);

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
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      await onAvatarUpdate(data.secure_url);

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

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24 ring-4 ring-primary ring-offset-2 ring-offset-card">
        <AvatarImage src={currentImage || undefined} alt={userName || userEmail} />
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
