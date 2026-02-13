import type { ImageLoaderProps } from "next/image";

const OPTIMIZED_IMAGE_HOSTS = [
  "res.cloudinary.com",
  "images.unsplash.com",
  "source.unsplash.com",
];

export function normalizeImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) {
    return null;
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return null;
  }
}

export function canOptimizeImageUrl(imageUrl: string) {
  if (imageUrl.startsWith("/")) {
    return true;
  }

  return OPTIMIZED_IMAGE_HOSTS.some((host) => imageUrl.includes(host));
}

export function passthroughImageLoader({ src }: ImageLoaderProps) {
  return src;
}
