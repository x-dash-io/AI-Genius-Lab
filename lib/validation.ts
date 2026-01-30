/**
 * Input validation utilities
 */

import { z } from "zod";

// Course validation schemas
export const courseSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional(),
  priceCents: z.number().int().min(0).max(10000000), // Max $100,000
  isPublished: z.boolean().optional(),
});

// Review validation schemas
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).nullable().optional(),
});

// User validation schemas
export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  contentType: z.enum(["video", "audio", "pdf", "file"]),
  fileSize: z.number().max(500 * 1024 * 1024), // 500MB max
  mimeType: z.string(),
});

/**
 * Validate and sanitize input
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe parse with error handling
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map((e) => e.message).join(", "),
  };
}
