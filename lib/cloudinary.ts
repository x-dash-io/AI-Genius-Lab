import { v2 as cloudinary } from "cloudinary";

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

export function getSignedCloudinaryUrl(
  publicId: string,
  resourceType: CloudinaryResourceType,
  options: { download?: boolean } = {}
) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 10;
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    type: "authenticated",
    resource_type: resourceType,
    expires_at: expiresAt,
    attachment: options.download ? publicId : undefined,
  });
}
