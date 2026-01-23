import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/access";
import { uploadToCloudinary, getResourceTypeFromFile } from "@/lib/cloudinary";
import { rateLimits } from "@/lib/rate-limit";

// File size limits (in bytes) - much more generous for videos and large files
const MAX_FILE_SIZES = {
  video: 5 * 1024 * 1024 * 1024, // 5 GB for videos
  audio: 500 * 1024 * 1024, // 500 MB for audio
  pdf: 500 * 1024 * 1024, // 500 MB for PDFs
  file: 2 * 1024 * 1024 * 1024, // 2 GB for other files
};

// Allowed MIME types - expanded to cover more formats
const ALLOWED_MIME_TYPES = {
  video: [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    "video/x-matroska",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/flv",
    "video/mkv",
  ],
  audio: [
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/aac",
    "audio/mp4",
    "audio/m4a",
    "audio/flac",
    "audio/wma",
  ],
  pdf: ["application/pdf"],
  file: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
};

export async function POST(request: NextRequest) {
  try {
    // Require admin role
    await requireRole("admin");

    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateLimitResult = await rateLimits.upload(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many upload requests. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const contentType = formData.get("contentType") as
      | "video"
      | "audio"
      | "pdf"
      | "file"
      | null;
    const folder = (formData.get("folder") as string) || "synapze-content";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!contentType) {
      return NextResponse.json(
        { error: "Content type is required" },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[contentType];
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    const allowedMimeTypes = ALLOWED_MIME_TYPES[contentType];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `File type ${file.type} is not allowed for ${contentType} content`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine resource type - ensure PDFs and documents are uploaded as raw
    const resourceType = getResourceTypeFromFile(file.name, file.type);

    // Upload to Cloudinary - remove restrictive allowedFormats that cause issues
    const result = await uploadToCloudinary(buffer, {
      folder,
      resourceType,
      // allowedFormats removed to prevent upload failures
    });

    return NextResponse.json({
      success: true,
      publicId: result.publicId,
      secureUrl: result.secureUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
