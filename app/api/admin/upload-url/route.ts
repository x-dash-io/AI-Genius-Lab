import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/access";
import { uploadToCloudinary, getResourceTypeFromFile } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    // Require admin role
    await requireRole("admin");

    const body = await request.json();
    const { url, contentType, folder } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Validate content type
    if (!["video", "audio", "pdf", "file"].includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    // Fetch the file from URL
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file from URL: ${response.statusText}` },
        { status: 400 }
      );
    }

    // Get content type from response
    const mimeType = response.headers.get("content-type") || "";
    const contentLength = response.headers.get("content-length");

    // Validate file size (if available)
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      const maxSize = contentType === "video" ? 500 * 1024 * 1024 : 100 * 1024 * 1024;
      if (size > maxSize) {
        return NextResponse.json(
          { error: "File size exceeds maximum allowed size" },
          { status: 400 }
        );
      }
    }

    // Get filename from URL or content-disposition header
    const contentDisposition = response.headers.get("content-disposition");
    let filename = url.split("/").pop() || "uploaded-file";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Determine resource type
    const resourceType = getResourceTypeFromFile(filename, mimeType);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(url, {
      folder: folder || "synapze-content",
      resourceType,
    });

    return NextResponse.json({
      success: true,
      publicId: result.publicId,
      secureUrl: result.secureUrl,
    });
  } catch (error) {
    console.error("URL upload error:", error);

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
