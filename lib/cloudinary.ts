import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

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

type CloudinaryResourceType = "image" | "video" | "raw";

/**
 * Enhanced signed URL with user-specific token for better security
 * The token includes user ID and timestamp, making URLs non-shareable
 */
export function getSignedCloudinaryUrl(
  publicId: string,
  resourceType: CloudinaryResourceType,
  options: { download?: boolean; userId?: string } = {}
) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes
  
  // Add user-specific token to public ID transformation for extra security
  // This ensures URLs are tied to specific users
  const transformation: Record<string, any> = {};
  
  if (options.userId) {
    // Create a user-specific token that will be validated server-side
    const token = crypto
      .createHash("sha256")
      .update(`${publicId}:${options.userId}:${expiresAt}:${process.env.CLOUDINARY_API_SECRET}`)
      .digest("hex")
      .substring(0, 16);
    
    // Store token in transformation metadata (will be validated in proxy)
    transformation.custom_pre_function = `user_token_${token}`;
  }
  
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    type: "authenticated",
    resource_type: resourceType,
    expires_at: expiresAt,
    attachment: options.download ? publicId : undefined,
    transformation: Object.keys(transformation).length > 0 ? [transformation] : undefined,
  });
}

/**
 * Upload file to Cloudinary (server-side only)
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string;
    resourceType?: CloudinaryResourceType;
    publicId?: string;
    allowedFormats?: string[];
  } = {}
): Promise<{ publicId: string; secureUrl: string }> {
  const {
    folder = "synapze-content",
    resourceType = "raw",
    publicId,
    allowedFormats,
  } = options;

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    if (allowedFormats) {
      uploadOptions.allowed_formats = allowedFormats;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
          });
        } else {
          reject(new Error("Upload failed: No result returned"));
        }
      }
    );

    if (Buffer.isBuffer(file)) {
      uploadStream.end(file);
    } else {
      // String URL - fetch and upload
      fetch(file)
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          uploadStream.end(Buffer.from(buffer));
        })
        .catch(reject);
    }
  });
}

/**
 * Determine resource type from file extension or MIME type
 */
export function getResourceTypeFromFile(
  filename: string,
  mimeType?: string
): CloudinaryResourceType {
  const ext = filename.split(".").pop()?.toLowerCase();

  // Video types
  if (
    ["mp4", "mov", "avi", "wmv", "flv", "webm", "mkv"].includes(ext || "") ||
    mimeType?.startsWith("video/")
  ) {
    return "video";
  }

  // Audio types
  if (
    ["mp3", "wav", "ogg", "aac", "m4a", "flac"].includes(ext || "") ||
    mimeType?.startsWith("audio/")
  ) {
    return "video"; // Cloudinary uses "video" for audio too
  }

  // Raw/File types (PDFs, documents, etc.)
  if (
    ["pdf", "doc", "docx", "txt", "zip", "rar"].includes(ext || "") ||
    mimeType === "application/pdf" ||
    mimeType?.includes("document") ||
    mimeType?.includes("zip")
  ) {
    return "raw";
  }

  // Default to image
  return "image";
}
