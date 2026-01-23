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
