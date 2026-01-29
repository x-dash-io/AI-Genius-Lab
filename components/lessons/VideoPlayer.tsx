"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  originalSrc?: string | null;
  lessonId: string;
  contentType?: string;
  allowDownload?: boolean;
  onProgress?: (progress: number) => void;
}

export function VideoPlayer({
  src,
  originalSrc,
  lessonId,
  contentType,
  allowDownload,
  onProgress,
}: VideoPlayerProps) {
  // Use separate refs for video and audio to avoid type conflicts with strict RefObjects
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const media = e.currentTarget;
    const current = media.currentTime;
    const total = media.duration || 0;

    if (total > 0) {
      const percent = (current / total) * 100;
      debouncedProgressUpdate(current, percent);
      onProgress?.(percent);
    }
  }, [debouncedProgressUpdate, onProgress]);

  const clearLoadingTimeout = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const handleLoadedMetadata = useCallback(() => clearLoadingTimeout(), [clearLoadingTimeout]);
  const handleCanPlay = useCallback(() => clearLoadingTimeout(), [clearLoadingTimeout]);
  const handleCanPlayThrough = useCallback(() => clearLoadingTimeout(), [clearLoadingTimeout]);
  const handleLoadedData = useCallback(() => clearLoadingTimeout(), [clearLoadingTimeout]);
  const handleLoadStart = useCallback(() => setIsLoading(true), []);
  const handleWaiting = useCallback(() => setIsLoading(true), []);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
    const media = e.currentTarget;
    let errorDetail = "";
    if (media.error) {
      switch (media.error.code) {
        case 1: errorDetail = "The fetching process was aborted by the user."; break;
        case 2: errorDetail = "A network error occurred."; break;
        case 3: errorDetail = "An error occurred while decoding the media."; break;
        case 4: errorDetail = "The media could not be loaded, either because the server or network failed or because the format is not supported."; break;
        default: errorDetail = "An unknown error occurred.";
      }
    }

    console.error("Media error:", e, media.error);
    setError({
      message: `Failed to load ${contentType || 'media'} content. ${errorDetail}`
    });
    clearLoadingTimeout();
  }, [contentType, clearLoadingTimeout]);

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

  useEffect(() => {
    // Check both refs
    const mediaElement = videoRef.current || audioRef.current;
    if (!mediaElement) return;

    // If media is already loaded (e.g. from cache), clear loading state
    if (mediaElement.readyState >= 2) { // HAVE_CURRENT_DATA
      setIsLoading(false);
    }
  }, []);

  // Helper to detect external video services
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    
    return null;
  };

  const embedUrl = getEmbedUrl(originalSrc || '');
  
  // Use the signed URL directly for better reliability with media elements (redirects can break range requests)
  // Only use originalSrc if it's a valid absolute URL (e.g. external content).
  // If it's a Cloudinary public ID (DB contentUrl), we must use the proxy (src) to get a signed URL.
  const isOriginalSrcValidUrl = originalSrc && (originalSrc.startsWith('http://') || originalSrc.startsWith('https://'));
  const mediaSrc = (contentType === 'video' || contentType === 'audio') && isOriginalSrcValidUrl ? originalSrc : src;

  useEffect(() => {
    if (mediaSrc) {
      console.log(`[VideoPlayer] Loading ${contentType}:`, mediaSrc);
      // Reset error state when src changes
      setError(null);
      setIsLoading(true);

      // Set a timeout to force-disable loading indicator after 5 seconds
      // This prevents the "infinite loading" UI state if the browser is slow or blocks auto-loading
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingTimeoutRef.current = null;
      }, 5000);
    }

    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, [mediaSrc, contentType]);

  if (error) {
    return (
      <div className={cn(
        "relative w-full bg-muted rounded-xl overflow-hidden flex items-center justify-center border",
        contentType === 'audio' ? "py-12" : "aspect-video"
      )}>
        <div className="text-center p-8 max-w-md">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 mx-auto mb-4">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
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

  // Handle YouTube/Vimeo embeds
  if (embedUrl) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => clearLoadingTimeout()}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Handle Audio Content
  if (contentType === 'audio') {
    return (
      <div className="relative w-full rounded-xl border bg-card p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">Audio Lesson</h3>
              <p className="text-sm text-muted-foreground">Click the play button below to listen to this lesson</p>
            </div>
          </div>
          
          <div className="relative">
            <audio
              ref={audioRef}
              src={mediaSrc}
              className="w-full"
              controls
              controlsList={allowDownload ? undefined : "nodownload"}
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onLoadedData={handleLoadedData}
              onEnded={handleEnded}
              onError={handleError}
              onWaiting={handleWaiting}
              onCanPlay={handleCanPlay}
              onCanPlayThrough={handleCanPlayThrough}
              onLoadStart={handleLoadStart}
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-[1px] pointer-events-none">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            )}
          </div>
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
          src={mediaSrc}
          className="w-full h-full"
          controls
          controlsList={allowDownload ? undefined : "nodownload"}
          preload="auto"
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={handleLoadedData}
          onEnded={handleEnded}
          onError={handleError}
          onWaiting={handleWaiting}
          onCanPlay={handleCanPlay}
          onCanPlayThrough={handleCanPlayThrough}
          onLoadStart={handleLoadStart}
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
