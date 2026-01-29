"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactPlayer from "react-player";
import { useDebouncedCallback } from "use-debounce";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  originalSrc?: string | null;
  lessonId: string;
  contentType?: string;
  allowDownload?: boolean;
  onProgress?: (progress: number) => void;
}

interface ProgressState {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

export function VideoPlayer({
  src,
  originalSrc,
  lessonId,
  contentType,
  allowDownload,
  onProgress,
}: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    adminActionRequired?: boolean;
    code?: string;
  } | null>(null);

  // Debounced progress update
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
    3000
  );

  const handleProgress = useCallback((state: ProgressState) => {
    // Only track progress if video is actually playing and we have a valid duration
    if (state.played > 0) {
      const percent = state.played * 100;
      debouncedProgressUpdate(state.playedSeconds, percent);
      onProgress?.(percent);
    }
  }, [debouncedProgressUpdate, onProgress]);

  const handleError = useCallback((e: any) => {
    console.error("Media error:", e);
    setIsLoading(false);
    setError({
      message: "Failed to load content. The format might not be supported or the network connection failed."
    });
  }, []);

  const handleEnded = useCallback(async () => {
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
  }, [lessonId]);

  // Determine source URL
  // If originalSrc is a valid HTTP URL, use it directly (e.g. YouTube, Vimeo, direct S3 link)
  // Otherwise, fallback to the proxy URL (src) which handles Cloudinary signing and redirection
  const isOriginalSrcValidUrl = originalSrc && (originalSrc.startsWith('http://') || originalSrc.startsWith('https://'));
  const mediaSrc = (contentType === 'video' || contentType === 'audio') && isOriginalSrcValidUrl ? originalSrc : src;

  // Reset state when src changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setIsReady(false);
  }, [mediaSrc]);

  if (error) {
    return (
      <div className={cn(
        "relative w-full bg-muted rounded-xl overflow-hidden flex items-center justify-center border",
        contentType === 'audio' ? "py-12" : "aspect-video"
      )}>
        <div className="text-center p-8 max-w-md">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-lg font-semibold mb-2">Content Unavailable</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          {originalSrc && originalSrc.startsWith('http') && !originalSrc.includes('cloudinary.com') && (
            <div className="mt-4">
              <a 
                href={originalSrc} 
                target="_blank" 
                rel="noreferrer"
                className="text-primary hover:underline text-sm font-medium"
              >
                Try opening in a new tab
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Common wrapper styling
  const wrapperClass = cn(
    "relative w-full overflow-hidden rounded-xl border bg-black shadow-lg",
    contentType === 'audio' ? "h-auto p-4 bg-card" : "aspect-video"
  );

  return (
    <div className={wrapperClass}>
      {contentType === 'audio' && (
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
             <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </div>
          <div>
             <h3 className="font-semibold text-base">Audio Lesson</h3>
             <p className="text-xs text-muted-foreground">Listen to the audio content</p>
          </div>
        </div>
      )}

      <div className={cn("relative w-full h-full", contentType === 'audio' ? "h-12" : "")}>
        <ReactPlayer
          url={mediaSrc || ""}
          width="100%"
          height="100%"
          controls={true}
          playing={false}
          onReady={() => {
            setIsReady(true);
            setIsLoading(false);
          }}
          onStart={() => setIsLoading(false)}
          onBuffer={() => setIsLoading(true)}
          onBufferEnd={() => setIsLoading(false)}
          onError={handleError}
          onEnded={handleEnded}
          // @ts-expect-error ReactPlayer onProgress type definition conflict with strict TS
          onProgress={handleProgress}
          // @ts-expect-error Config type definition mismatch
          config={{
            file: {
              attributes: {
                controlsList: allowDownload ? undefined : 'nodownload',
                // Important for audio to prevent layout issues
                style: contentType === 'audio' ? { height: '54px' } : {}
              },
              forceAudio: contentType === 'audio'
            }
          }}
        />

        {/* Loading Overlay */}
        {isLoading && !isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
              {contentType === 'video' && <p className="text-xs text-white/80">Loading...</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
