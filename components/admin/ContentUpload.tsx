"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, FileText, Loader2 } from "lucide-react";

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

  const handleFileUpload = async () => {
    if (!file) {
      onError?.("Please select a file");
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.publicId);
      setFile(null);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!url) {
      onError?.("Please enter a URL");
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.publicId);
      setUrl("");
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
            <Label>Select File</Label>
            <Input
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
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
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
