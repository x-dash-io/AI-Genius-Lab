"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Upload, X, Loader2, Link as LinkIcon } from "lucide-react";
import { toastError, toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    className?: string;
}

export function LogoImageUpload({ value, onChange, className }: LogoImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toastError("Invalid file type", "Please upload an image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toastError("File too large", "Max size is 5MB.");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("contentType", "image");
            formData.append("folder", "synapze-content/hero-logos");
            formData.append("returnUrl", "true");

            const response = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Upload failed");
            }

            const data = await response.json();
            onChange(data.secureUrl);
            toastSuccess("Logo uploaded", "The image has been processed.");
        } catch (error: any) {
            toastError("Upload failed", error.message);
        } finally {
            setUploading(false);
        }
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };

    return (
        <div className={cn("space-y-3", className)}>
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                className={cn(
                    "relative aspect-[3/1] rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-2 overflow-hidden bg-muted/30",
                    isDragOver ? "border-primary bg-primary/5 scale-[0.98]" : "border-muted-foreground/20 hover:border-primary/40",
                    value && "border-solid border-primary/20 bg-background"
                )}
            >
                {value ? (
                    <>
                        <img
                            src={value}
                            alt="Logo Preview"
                            className="h-full w-full object-contain p-4"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 rounded-lg"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Change
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={() => onChange("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        {uploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                            <>
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Upload className="h-5 w-5" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-foreground">Click or Drag Logo</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">PNG, SVG, WEBP (Max 5MB)</p>
                                </div>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={onFileSelect}
                            disabled={uploading}
                        />
                    </>
                )}
            </div>

            {/* Manual URL Input Option - Small & Discrete */}
            <div className="flex items-center gap-2 px-1">
                <LinkIcon className="h-3 w-3 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Or paste image URL..."
                    className="flex-1 bg-transparent text-[10px] outline-none border-b border-transparent focus:border-primary/30 transition-colors"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}
