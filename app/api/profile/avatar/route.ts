import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { v2 as cloudinary } from "cloudinary";
import { rateLimits } from "@/lib/rate-limit";
import { checkRateLimit, createStandardErrorResponse } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

let isCloudinaryConfigured = false;

function configureCloudinary() {
  if (isCloudinaryConfigured) return;
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary environment variables.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  
  isCloudinaryConfigured = true;
}

// Avatar-specific limits
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request, "upload");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Authorization check - require authenticated user
  const user = await requireUser();

  try {
    
    // Configure Cloudinary lazily
    configureCloudinary();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum allowed size of ${MAX_AVATAR_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary in user-specific folder with avatar optimizations
    const folder = `synapze-avatars/${user.id}`;
    
    return new Promise<NextResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
          transformation: [
            {
              width: 400,
              height: 400,
              crop: "fill",
              gravity: "face",
              quality: "auto",
              format: "auto",
            },
          ],
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            logger.error("Cloudinary upload error", { userId: user.id }, error instanceof Error ? error : undefined);
            reject(
              NextResponse.json(
                { error: "Failed to upload avatar" },
                { status: 500 }
              )
            );
          } else if (result) {
            resolve(
              NextResponse.json({
                success: true,
                publicId: result.public_id,
                secureUrl: result.secure_url,
              })
            );
          } else {
            reject(
              NextResponse.json(
                { error: "Upload failed: No result returned" },
                { status: 500 }
              )
            );
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
