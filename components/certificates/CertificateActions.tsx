"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Copy, ExternalLink } from "lucide-react";
import { toast } from "@/lib/toast";

interface CertificateActionsProps {
  certificateId: string;
  pdfUrl?: string | null; // Keep for backward compatibility but not used
  isCourse: boolean;
  itemSlug?: string | null;
}

export function CertificateActions({
  certificateId,
  pdfUrl,
  isCourse,
  itemSlug
}: CertificateActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleDownload = async () => {
    // Always generate and download PDF from API to ensure consistency
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/certificates/${certificateId}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Certificate downloaded successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download certificate",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    setIsCopying(true);
    try {
      const shareUrl = `${window.location.origin}/certificates/${certificateId}`;
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Link Copied!",
        description: "Certificate link copied to clipboard.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <Button
        className="w-full"
        variant="premium"
        size="lg"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        <Download className="mr-2 h-4 w-4" />
        {isDownloading ? "Downloading..." : "Download PDF"}
      </Button>

      {itemSlug && (
        <Button asChild className="w-full" variant="outline" size="lg">
          <a href={isCourse ? `/courses/${itemSlug}` : `/learning-paths/${itemSlug}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View {isCourse ? "Course" : "Path"}
          </a>
        </Button>
      )}
    </div>
  );
}

interface ShareAchievementProps {
  certificateId: string;
}

export function ShareAchievement({ certificateId }: ShareAchievementProps) {
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyLink = async () => {
    setIsCopying(true);
    try {
      const shareUrl = `${window.location.origin}/certificates/${certificateId}`;
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Link Copied!",
        description: "Certificate link copied to clipboard.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/certificates/${certificateId}`;
    const shareText = "Check out my certificate of completion from AI Genius Lab!";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Certificate of Completion",
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyLink();
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Button
        variant="outline"
        size="sm"
        className="flex-1 text-xs"
        onClick={handleCopyLink}
        disabled={isCopying}
      >
        <Copy className="mr-1 h-3 w-3" />
        {isCopying ? "Copying..." : "Copy Link"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 text-xs"
        onClick={handleShare}
      >
        <Share2 className="mr-1 h-3 w-3" />
        Share
      </Button>
    </div>
  );
}
