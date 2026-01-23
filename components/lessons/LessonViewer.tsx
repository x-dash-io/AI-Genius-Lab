"use client";

import { useState, useEffect } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, PlayCircle, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface LessonViewerProps {
  lessonId: string;
  contentType: string | undefined;
  contentUrl: string | null;
  allowDownload: boolean;
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
  allowDownload,
  initialProgress,
}: LessonViewerProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [isCompleting, setIsCompleting] = useState(false);
  const [contentError, setContentError] = useState<{
    message: string;
    adminActionRequired?: boolean;
    code?: string;
  } | null>(null);

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
        toast({
          title: "Lesson Completed!",
          description: "Great job completing this lesson.",
          variant: "success",
        });
      } else {
        throw new Error("Failed to mark lesson as completed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark lesson as completed",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleProgressUpdate = (percent: number) => {
    setProgress((prev) => ({
      ...prev!,
      completionPercent: percent,
    }));
  };

  if (!contentUrl) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-300 text-center">
        <p>No content available for this lesson yet.</p>
      </div>
    );
  }

  // Handle content missing from storage error
  if (contentError?.code === "CONTENT_MISSING_FROM_STORAGE") {
    return (
      <div className="rounded-2xl border border-amber-800 bg-amber-900/20 p-6">
        <div className="text-center">
          <div className="text-amber-400 mb-4">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold">Content Needs Re-upload</h3>
          </div>
          <p className="text-amber-200 mb-4">{contentError.message}</p>
          {contentError.adminActionRequired ? (
            <div className="bg-amber-900/40 rounded-lg p-4 text-left">
              <p className="text-sm text-amber-100 mb-2">
                <strong>For Administrators:</strong> This content exists in our database but the file is missing from storage.
              </p>
              <p className="text-sm text-amber-100">
                Please go to the course editor and re-upload the content file for this lesson.
              </p>
            </div>
          ) : (
            <p className="text-sm text-amber-200">
              Please contact support if this issue persists.
            </p>
          )}
        </div>
      </div>
    );
  }

  // For video content, use the VideoPlayer
  if (contentType === "video" || contentType === "audio") {
    return (
      <div className="space-y-4">
        <VideoPlayer
          src={`/api/content/${lessonId}`}
          lessonId={lessonId}
          allowDownload={allowDownload}
          onProgress={handleProgressUpdate}
        />
        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress.completionPercent)}%</span>
            </div>
            <Progress value={progress.completionPercent} />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {progress?.completedAt ? (
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                In Progress
              </span>
            )}
          </div>
          {!progress?.completedAt && (
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              variant="outline"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Marking...
                </>
              ) : (
                "Mark as Complete"
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // For other content types (PDF, link, file)
  // Check if content is available before showing link
  useEffect(() => {
    const checkContent = async () => {
      try {
        const response = await fetch(`/api/content/${lessonId}`, { method: 'HEAD' });
        if (!response.ok) {
          let errorData = {};
          try {
            const text = await response.text();
            if (text) {
              errorData = JSON.parse(text);
            }
          } catch (e) {
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
  }, [lessonId]);

  if (contentError?.code === "CONTENT_MISSING_FROM_STORAGE") {
    return (
      <div className="rounded-2xl border border-amber-800 bg-amber-900/20 p-6">
        <div className="text-center">
          <div className="text-amber-400 mb-4">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold">Content Unavailable</h3>
          </div>
          <p className="text-amber-200 mb-4">{contentError.message}</p>
          {contentError.adminActionRequired ? (
            <div className="bg-amber-900/40 rounded-lg p-4 text-left">
              <p className="text-sm text-amber-100">
                This content exists in our database but the file is missing from storage. 
                Please contact support or ask an administrator to re-upload this content.
              </p>
            </div>
          ) : (
            <p className="text-sm text-amber-200">
              Please contact support if this issue persists.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <a
          href={`/api/content/${lessonId}`}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-white underline inline-flex items-center gap-2"
        >
          Open {contentType ? contentType.toUpperCase() : 'UNKNOWN'} content
          {allowDownload && <span className="text-xs">(Downloadable)</span>}
        </a>
      </div>
      {progress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress.completionPercent)}%</span>
          </div>
          <Progress value={progress.completionPercent} />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {progress?.completedAt ? (
            <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </span>
          ) : (
            <span>Not completed</span>
          )}
        </div>
        {!progress?.completedAt && (
          <Button
            onClick={handleComplete}
            disabled={isCompleting}
            variant="outline"
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Marking...
              </>
            ) : (
              "Mark as Complete"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
