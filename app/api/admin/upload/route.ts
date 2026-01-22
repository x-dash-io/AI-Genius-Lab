import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/access";
import { uploadToCloudinary, getResourceTypeFromFile } from "@/lib/cloudinary";

// File size limits (in bytes)
const MAX_FILE_SIZES = {
  video: 500 * 1024 * 1024, // 500 MB
  audio: 100 * 1024 * 1024, // 100 MB
  pdf: 50 * 1024 * 1024, // 50 MB
  file: 100 * 1024 * 1024, // 100 MB
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  video: [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    "video/x-matroska",
  ],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/mp4"],
  pdf: ["application/pdf"],
  file: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-rar-compressed",
  ],
};

export async function POST(request: NextRequest) {
  try {
    // Require admin role
    await requireRole("admin");

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

    // Determine resource type
    const resourceType = getResourceTypeFromFile(file.name, file.type);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, {
      folder,
      resourceType,
      allowedFormats: allowedMimeTypes,
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
