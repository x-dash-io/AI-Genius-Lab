import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

// Cache for content existence checks to avoid repeated API calls
const existenceCache = new Map<string, { exists: boolean; checkedAt: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let isConfigured = false;

/**
 * Lazy initialization of Cloudinary configuration.
 * Validates and configures cloudinary only when first used.
 * Throws an error if credentials are missing when actually needed.
 */
function configureCloudinary(): void {
  if (isConfigured) {
    return;
  }

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

  isConfigured = true;
}

type CloudinaryResourceType = "image" | "video" | "raw";

/**
 * Enhanced signed URL with expiration for security
 * URLs expire in 10 minutes and are generated per request after authentication
 */
export function getSignedCloudinaryUrl(
  publicId: string,
  resourceType: CloudinaryResourceType,
  options: { download?: boolean; userId?: string } = {}
) {
  configureCloudinary();

  // Validate and clean publicId
  if (!publicId || typeof publicId !== 'string' || publicId.trim() === '') {
    console.error('[Cloudinary] Invalid publicId:', publicId);
    return null;
  }

  let cleanPublicId = publicId.trim();
  console.log('[Cloudinary] Original publicId:', publicId);

  // If it's a full Cloudinary URL, extract the public ID
  if (cleanPublicId.includes('cloudinary.com')) {
    try {
      const url = new URL(cleanPublicId);
      // Extract path after /v1/ or similar version
      const pathParts = url.pathname.split('/').filter(p => p && p !== 'v1');
      cleanPublicId = pathParts.join('/');
      console.log('[Cloudinary] Extracted from URL:', cleanPublicId);
    } catch (error) {
      console.error('[Cloudinary] Error parsing URL:', cleanPublicId, error);
      return null;
    }
  }

  // Remove any query parameters or fragments
  cleanPublicId = cleanPublicId.split('?')[0].split('#')[0];

  // Basic validation - should contain folder structure
  if (!cleanPublicId.includes('/') || cleanPublicId.length < 10) {
    console.error('[Cloudinary] Invalid format:', cleanPublicId, 'from original:', publicId);
    return null;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

  try {
    const signedUrl = cloudinary.url(cleanPublicId, {
      secure: true,
      sign_url: true,
      type: "authenticated",
      resource_type: resourceType,
      expires_at: expiresAt,
      attachment: options.download ? cleanPublicId.split('/').pop() : undefined,
    });
    console.log('[Cloudinary] Generated signed URL successfully for:', cleanPublicId);
    return signedUrl;
  } catch (error) {
    console.error('[Cloudinary] Error generating URL for:', cleanPublicId, error);
    return null;
  }
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
  configureCloudinary();
  
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
 * Check if a resource exists in Cloudinary
 * Uses caching to avoid repeated API calls
 */
export async function checkCloudinaryResourceExists(
  publicId: string,
  resourceType: CloudinaryResourceType = "raw"
): Promise<boolean> {
  configureCloudinary();

  // Check cache first
  const cacheKey = `${resourceType}:${publicId}`;
  const cached = existenceCache.get(cacheKey);
  if (cached && (Date.now() - cached.checkedAt) < CACHE_DURATION) {
    return cached.exists;
  }

  try {
    // Use Cloudinary's resource method to check existence
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });

    const exists = !!result && result.public_id === publicId;
    existenceCache.set(cacheKey, { exists, checkedAt: Date.now() });
    return exists;
  } catch (error: any) {
    // If error indicates resource not found, cache as not exists
    if (error?.http_code === 404 || error?.error?.message?.includes('not found')) {
      existenceCache.set(cacheKey, { exists: false, checkedAt: Date.now() });
      return false;
    }

    // For other errors, assume it doesn't exist to be safe
    console.error('Error checking Cloudinary resource existence:', error);
    return false;
  }
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
