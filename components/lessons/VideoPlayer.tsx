"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  lessonId: string;
  allowDownload?: boolean;
  onProgress?: (progress: number) => void;
}

export function VideoPlayer({
  src,
  lessonId,
  allowDownload,
  onProgress,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    adminActionRequired?: boolean;
    code?: string;
  } | null>(null);

  // Debounced progress update to avoid too many API calls
  const debouncedProgressUpdate = useDebouncedCallback(
    async (position: number, percent: number) => {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            lastPosition: Math.floor(position),
            completionPercent: Math.round(percent),
          }),
        });
      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    },
    3000 // Update every 3 seconds to reduce API calls
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration || 0;

      if (total > 0) {
        const percent = (current / total) * 100;
        debouncedProgressUpdate(current, percent);
        onProgress?.(percent);
      }
    };

    const handleLoadedMetadata = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setError({ message: "Failed to load video content. The content may not be available yet." });
      setIsLoading(false);
    };

    const handleEnded = async () => {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            completed: true,
            completionPercent: 100,
          }),
        });
      } catch (error) {
        console.error("Failed to mark lesson as completed:", error);
      }
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadStart = () => setIsLoading(true);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadstart", handleLoadStart);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadstart", handleLoadStart);
    };
  }, [lessonId, debouncedProgressUpdate, onProgress]);

  if (error) {
    return (
      <div className="relative w-full aspect-video bg-muted rounded-xl overflow-hidden flex items-center justify-center border">
        <div className="text-center p-8 max-w-md">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 mx-auto mb-4">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-2">Content Unavailable</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Video Element with Native Controls */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full"
          controls
          controlsList={allowDownload ? undefined : "nodownload"}
          preload="metadata"
          playsInline
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
              <p className="text-sm text-white/80">Loading video...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
