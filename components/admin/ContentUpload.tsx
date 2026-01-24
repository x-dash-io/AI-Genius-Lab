"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, FileText, Loader2, File } from "lucide-react";
import { toast } from "@/lib/toast";
import { safeJsonParse } from "@/lib/utils";

interface ContentUploadProps {
  sectionId: string;
  contentType: string;
  value?: string;
  onChange: (publicId: string) => void;
  onError?: (error: string) => void;
}

export function ContentUpload({
  sectionId,
  contentType,
  value,
  onChange,
  onError,
}: ContentUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<"file" | "url" | "manual">("file");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [manualId, setManualId] = useState(value || "");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async () => {
    if (!file) {
      onError?.("Please select a file first");
      return;
    }

    // Validate file size before upload
    const maxSizes = {
      video: 5 * 1024 * 1024 * 1024, // 5GB
      audio: 500 * 1024 * 1024, // 500MB
      pdf: 500 * 1024 * 1024, // 500MB
      file: 2 * 1024 * 1024 * 1024, // 2GB
    };

    const maxSize = maxSizes[contentType as keyof typeof maxSizes] || 100 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      onError?.(`File size exceeds maximum allowed size of ${maxSizeMB}MB for ${contentType} files`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", contentType);
      formData.append("folder", `synapze-content/${sectionId}`);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.publicId);
      setFile(null);

      // Success toast
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded to Cloudinary`,
        variant: "success",
      });
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      onError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!url) {
      onError?.("Please enter a URL");
      return;
    }

    // Check if it's a YouTube URL
    const isYouTubeUrl = url.includes('youtube.com') || url.includes('youtu.be');
    if (isYouTubeUrl) {
      onError?.("YouTube videos cannot be uploaded to Cloudinary. Please use 'Link' content type instead and paste the YouTube URL directly.");
      return;
    }

    setUploading(true);
    try {
      const response = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          contentType,
          folder: `synapze-content/${sectionId}`,
        }),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.publicId);
      setUrl("");
      
      // Success toast
      toast({
        title: "URL uploaded successfully",
        description: "Content has been uploaded to Cloudinary",
        variant: "success",
      });
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setManualId(newValue);
    onChange(newValue);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const droppedFile = files[0];

      // Validate file type
      const expectedTypes = contentType === "video" ? ["video/"] :
                          contentType === "audio" ? ["audio/"] :
                          contentType === "pdf" ? ["application/pdf"] : [];

      const isValidType = expectedTypes.some(type => droppedFile.type.startsWith(type)) ||
                         contentType === "file" ||
                         expectedTypes.length === 0;

      if (!isValidType) {
        onError?.(`Invalid file type. Expected ${contentType} file.`);
        return;
      }

      setFile(droppedFile);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="file">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url">
            <LinkIcon className="h-4 w-4 mr-2" />
            From URL
          </TabsTrigger>
          <TabsTrigger value="manual">
            <FileText className="h-4 w-4 mr-2" />
            Manual ID
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <div className="space-y-2">
            <Label>Upload File</Label>

            {/* Modern File Chooser */}
            <div className="relative">
              <input
                type="file"
                accept={
                  contentType === "video"
                    ? "video/*"
                    : contentType === "audio"
                    ? "audio/*"
                    : contentType === "pdf"
                    ? "application/pdf"
                    : "*"
                }
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id={`file-input-${sectionId}`}
              />

              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/20"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    {isDragOver ? "Drop your file here" : `Drop your ${contentType} file here, or click to browse`}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {contentType === "video" && "Supports MP4, MOV, AVI, WebM, MKV and more"}
                    {contentType === "audio" && "Supports MP3, WAV, OGG, AAC, M4A and more"}
                    {contentType === "pdf" && "Supports PDF documents"}
                    {contentType === "file" && "Supports various file types"}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    className="cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-solid border-green-300 bg-green-50 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-green-800 truncate">{file.name}</p>
                      <p className="text-sm text-green-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "Unknown type"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="text-green-600 hover:text-green-800 hover:bg-green-100"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={handleFileUpload}
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to Cloudinary
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label>Content URL</Label>
            <Input
              type="url"
              placeholder="https://example.com/video.mp4"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Note: For YouTube videos, use the "Link" content type instead. This uploads the file from the URL to Cloudinary.
            </p>
            <Button
              type="button"
              onClick={handleUrlUpload}
              disabled={!url || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Upload from URL
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div className="space-y-2">
            <Label>Cloudinary Public ID</Label>
            <Input
              type="text"
              placeholder="e.g., synapze-content/lesson-1-video"
              value={manualId}
              onChange={handleManualChange}
            />
            <p className="text-xs text-muted-foreground">
              Enter the Cloudinary public ID if you've already uploaded the file manually.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {value && (
        <div className="rounded-md bg-muted p-3">
          <p className="text-sm font-medium">Current Public ID:</p>
          <p className="text-sm text-muted-foreground font-mono break-all">{value}</p>
        </div>
      )}
    </div>
  );
}
