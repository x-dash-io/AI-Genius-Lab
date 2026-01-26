"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface BlogImage {
  id?: string;
  url: string;
  alt: string | null | undefined;
  caption: string | null | undefined;
  sortOrder: number;
}

interface BlogImageUploadProps {
  images: BlogImage[];
  onChange: (images: BlogImage[]) => void;
  maxImages?: number;
}

export function BlogImageUpload({ images, onChange, maxImages = 10 }: BlogImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadPromises = acceptedFiles.map(async (file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size must be less than 5MB");
      }

      // Create form data for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "blog");

      // Upload to server
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const data = await response.json();
      
      return {
        url: data.url,
        alt: "",
        caption: "",
        sortOrder: images.length + acceptedFiles.indexOf(file),
      };
    });

    try {
      const newImages = await Promise.all(uploadPromises);
      onChange([...images, ...newImages]);
      toast({
        title: "Success",
        description: `${newImages.length} image(s) uploaded`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [images, onChange, maxImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
    disabled: uploading || images.length >= maxImages,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const updateImage = (index: number, updates: Partial<BlogImage>) => {
    const newImages = images.map((img, i) => 
      i === index ? { ...img, ...updates } : img
    );
    onChange(newImages);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    // Update sort orders
    newImages.forEach((img, i) => {
      img.sortOrder = i;
    });
    
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <Label>Images</Label>
      
      {/* Upload Area */}
      {images.length < maxImages && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? "Drop the images here"
                      : "Drag & drop images here, or click to select"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 5MB (max {maxImages} images)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((image, index) => (
            <Card key={image.id || index}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image.url}
                        alt={image.alt || "Blog image"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">Image {index + 1}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveImage(index, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveImage(index, "down")}
                          disabled={index === images.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div>
                        <Label htmlFor={`alt-${index}`}>Alt Text</Label>
                        <Input
                          id={`alt-${index}`}
                          value={image.alt || ""}
                          onChange={(e) => updateImage(index, { alt: e.target.value })}
                          placeholder="Describe the image for accessibility"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`caption-${index}`}>Caption</Label>
                        <Textarea
                          id={`caption-${index}`}
                          value={image.caption || ""}
                          onChange={(e) => updateImage(index, { caption: e.target.value })}
                          placeholder="Optional image caption"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
