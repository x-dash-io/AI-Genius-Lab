"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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
    2000 // Update every 2 seconds
  );

  useEffect(() => {
    // Check content availability first
    const checkContentAvailability = async () => {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.code === "CONTENT_MISSING_FROM_STORAGE") {
            setError({
              message: errorData.message || "Content needs to be re-uploaded by an administrator",
              adminActionRequired: errorData.adminActionRequired,
              code: errorData.code
            });
            return;
          }
        }
      } catch (error) {
        console.error("Error checking content availability:", error);
      }
    };

    checkContentAvailability();

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration || 0;
      setCurrentTime(current);

      if (total > 0) {
        const percent = (current / total) * 100;
        debouncedProgressUpdate(current, percent);
        onProgress?.(percent);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleError = () => {
      setError({ message: "Failed to load video content. The content may not be available yet." });
    };

    const handleEnded = async () => {
      setIsPlaying(false);
      // Mark as completed when video ends
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

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [lessonId, debouncedProgressUpdate, onProgress, src]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="relative w-full bg-black rounded-lg overflow-hidden p-8 text-center">
        <div className="text-white">
          <p className="text-lg font-medium mb-2">Content Unavailable</p>
          <p className="text-sm text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        className="w-full"
        controls={!allowDownload}
        controlsList={allowDownload ? undefined : "nodownload"}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <div className="flex items-center gap-2 text-white text-sm">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
