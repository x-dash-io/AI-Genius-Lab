"use client";

import { useState, useEffect, useCallback } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, PlayCircle, Loader2, Download, FileText, ExternalLink } from "lucide-react";
import { toast } from "@/lib/toast";

interface LessonViewerProps {
  lessonId: string;
  contentType: string | undefined;
  contentUrl: string | null;
  downloadUrl?: string | null;
  allowDownload: boolean;
  contentMetadata?: {
    title: string | null;
    description: string | null;
  } | null;
  initialProgress?: {
    lastPosition: number;
    completionPercent: number;
    completedAt: Date | null;
  } | null;
}

export function LessonViewer({
  lessonId,
  contentType,
  contentUrl,
  downloadUrl,
  allowDownload,
  contentMetadata,
  initialProgress,
}: LessonViewerProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [contentError, setContentError] = useState<{
    message: string;
    adminActionRequired?: boolean;
    code?: string;
  } | null>(null);

  // Check content availability for non-video/audio content types
  useEffect(() => {
    if (contentType && contentType !== "video" && contentType !== "audio" && contentUrl) {
      const checkContent = async () => {
        try {
          const response = await fetch(`/api/content/${lessonId}`, { method: 'HEAD' });
          if (!response.ok) {
            let errorData: {
              code?: string;
              message?: string;
              adminActionRequired?: boolean;
            } = {};
            try {
              const text = await response.text();
              if (text) errorData = JSON.parse(text);
            } catch {
              if (response.status === 404) {
                errorData = {
                  code: "CONTENT_MISSING_FROM_STORAGE",
                  message: "Content file is missing from storage.",
                  adminActionRequired: true
                };
              }
            }

            if (errorData.code === "CONTENT_MISSING_FROM_STORAGE" || response.status === 404) {
              setContentError({
                message: errorData.message || "Content file is missing from storage. Please contact support.",
                adminActionRequired: errorData.adminActionRequired,
                code: errorData.code || "CONTENT_MISSING_FROM_STORAGE"
              });
            }
          }
        } catch (error) {
          console.error("Error checking content:", error);
        }
      };

      checkContent();
    }
  }, [lessonId, contentType, contentUrl]);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          completed: true,
          completionPercent: 100,
        }),
      });

      if (response.ok) {
        setProgress((prev) => ({
          ...prev!,
          completedAt: new Date(),
          completionPercent: 100,
        }));

        // Emit custom event for real-time updates
        window.dispatchEvent(new CustomEvent('lessonProgressUpdate', {
          detail: {
            lessonId,
            progress: 100,
            completed: true
          }
        }));

        toast({
          title: "Lesson Completed!",
          description: "Great job! You've completed this lesson.",
          variant: "success",
        });
      } else {
        throw new Error("Failed to mark lesson as completed");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to mark lesson as completed",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleProgressUpdate = useCallback((percent: number) => {
    setProgress((prev) => ({
      ...prev!,
      completionPercent: percent,
    }));

    // Emit custom event for real-time updates
    window.dispatchEvent(new CustomEvent('lessonProgressUpdate', {
      detail: {
        lessonId,
        progress: percent,
        completed: false
      }
    }));
  }, [lessonId]);

  const handleDownload = async () => {
    const targetUrl = downloadUrl || `/api/content/${lessonId}?download=true`;
    setIsDownloading(true);
    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Try to determine a good filename
      const extension = contentType === 'pdf' ? '.pdf' :
        contentType === 'audio' ? '.mp3' :
          contentType === 'video' ? '.mp4' : '';
      const baseName = contentMetadata?.title || "lesson-content";
      link.download = baseName.toLowerCase().endsWith(extension) ? baseName : `${baseName}${extension}`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        title: "Error",
        description: "Failed to download content",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!contentUrl) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <div className="h-20 w-20 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <svg className="h-10 w-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Content Coming Soon</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Content for this lesson is being prepared. Check back soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle content missing from storage error
  if (contentError?.code === "CONTENT_MISSING_FROM_STORAGE") {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 mx-auto mb-4">
            <svg className="h-10 w-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Content Unavailable</h3>
          <p className="text-sm text-muted-foreground mb-4">{contentError.message}</p>
          {contentError.adminActionRequired && (
            <div className="bg-muted rounded-lg p-4 text-left border">
              <p className="text-sm leading-relaxed">
                <strong className="font-semibold">For Administrators:</strong> This content exists in the database but the file is missing from storage. Please re-upload the content file for this lesson.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For video content, use the VideoPlayer
  if (contentType === "video" || contentType === "audio") {
    return (
      <div className="space-y-6">
        <VideoPlayer
          key={lessonId}
          src={`/api/content/${lessonId}`}
          originalSrc={contentUrl}
          lessonId={lessonId}
          contentType={contentType}
          allowDownload={allowDownload}
          onProgress={handleProgressUpdate}
        />


        {allowDownload && (
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="lg" onClick={handleDownload} disabled={isDownloading}>
              <Download className="mr-2 h-4 w-4" />
              {isDownloading
                ? "Downloading..."
                : `Download ${contentType === 'audio' ? 'Audio' : 'Video'}`}
            </Button>
          </div>
        )}

        {/* Progress Section */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Your Progress</span>
            <span className="text-lg font-bold">{Math.round(progress?.completionPercent || 0)}%</span>
          </div>
          <Progress value={progress?.completionPercent || 0} className="h-2" />

          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="text-sm">
              {progress?.completedAt ? (
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  Completed
                </span>
              ) : (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <PlayCircle className="h-5 w-5" />
                  In Progress
                </span>
              )}
            </div>
            {!progress?.completedAt && (
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                size="lg"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Marking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For other content types (PDF, link, file)
  return (
    <div className="space-y-6">
      {/* Content Access Card */}
      <div className="rounded-xl border bg-card p-8">
        <div className="flex flex-col items-center text-center gap-6 max-w-md mx-auto">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            {contentType === 'pdf' ? (
              <FileText className="h-10 w-10 text-primary" />
            ) : (
              <ExternalLink className="h-10 w-10 text-primary" />
            )}
          </div>

          <div className="space-y-3 w-full">
            <h3 className="text-xl font-semibold">
              {contentType === 'pdf' ? 'PDF Document' : contentType === 'link' ? 'External Resource' : 'File Resource'}
            </h3>

            {/* Smart Metadata Display */}
            {contentMetadata && (
              <div className="space-y-2 text-left bg-muted/50 rounded-lg p-4 border">
                {contentMetadata.title && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">File Name</p>
                    <p className="text-sm font-medium break-all">{contentMetadata.title}</p>
                  </div>
                )}
                {contentMetadata.description && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Details</p>
                    <p className="text-sm text-muted-foreground">{contentMetadata.description}</p>
                  </div>
                )}
                {contentType === 'pdf' && (
                  <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      PDF Format
                    </span>
                    {allowDownload && (
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        Downloadable
                      </span>
                    )}
                  </div>
                )}
                {contentType === 'file' && contentMetadata.title && (
                  <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {contentMetadata.title.split('.').pop()?.toUpperCase() || 'FILE'}
                    </span>
                    {allowDownload && (
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        Downloadable
                      </span>
                    )}
                  </div>
                )}
                {contentType === 'link' && (
                  <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
                    <ExternalLink className="h-3 w-3" />
                    Opens in new tab
                  </div>
                )}
              </div>
            )}

            {!contentMetadata && (
              <p className="text-sm text-muted-foreground">
                Click below to access the {contentType?.toUpperCase()} content
              </p>
            )}
          </div>

          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href={`/api/content/${lessonId}`}>
              <ExternalLink className="h-5 w-5 mr-2" />
              {contentType === 'link' ? 'Open Link' : allowDownload ? 'Download' : 'Open'} Content
            </a>
          </Button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Your Progress</span>
          <span className="text-lg font-bold">{Math.round(progress?.completionPercent || 0)}%</span>
        </div>
        <Progress value={progress?.completionPercent || 0} className="h-2" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-6 border-t">
          <div className="text-sm">
            {progress?.completedAt ? (
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Completed
              </span>
            ) : (
              <span className="flex items-center gap-2 text-muted-foreground">
                <PlayCircle className="h-5 w-5" />
                Not completed
              </span>
            )}
          </div>
          {!progress?.completedAt && (
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              className="w-full sm:w-auto"
              size="lg"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Complete
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
