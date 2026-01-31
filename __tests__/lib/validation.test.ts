/**
 * Unit tests for validation utilities
 */

import { 
  validateInput, 
  safeParse, 
  validateRequestBody, 
  validateQueryParams,
  progressUpdateSchema,
  certificateCheckSchema,
  certificateDownloadSchema
} from "@/lib/validation";
import { z } from "zod";

describe("Validation Utilities", () => {
  describe("validateInput", () => {
    it("should validate correct input", () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0),
      });

      const result = validateInput(schema, { name: "John", age: 25 });
      expect(result).toEqual({ name: "John", age: 25 });
    });

    it("should throw error for invalid input", () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0),
      });

      expect(() => validateInput(schema, { name: "", age: -5 })).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid input", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const result = safeParse(schema, { email: "test@example.com" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ email: "test@example.com" });
      }
    });

    it("should return error for invalid input", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const result = safeParse(schema, { email: "invalid-email" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("email");
      }
    });
  });

  describe("validateRequestBody", () => {
    it("should return success for valid request body", () => {
      const schema = z.object({
        title: z.string().min(1),
      });

      const result = validateRequestBody(schema, { title: "Test Title" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ title: "Test Title" });
      }
    });

    it("should return error response for invalid request body", () => {
      const schema = z.object({
        title: z.string().min(1),
      });

      expect(() => validateRequestBody(schema, { title: "" })).toThrow("Validation failed");
    });
  });

  describe("validateQueryParams", () => {
    it("should validate URL search parameters", () => {
      const schema = z.object({
        page: z.string().transform(Number),
        limit: z.string().transform(Number),
      });

      const searchParams = new URLSearchParams("page=1&limit=10");
      const result = validateQueryParams(schema, searchParams);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ page: 1, limit: 10 });
      }
    });

    it("should handle missing parameters", () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const searchParams = new URLSearchParams("required=value");
      const result = validateQueryParams(schema, searchParams);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ required: "value", optional: undefined });
      }
    });
  });

  describe("specific validation schemas", () => {
    describe("progressUpdateSchema", () => {
      it("should validate progress update with all fields", () => {
        const validData = {
          lessonId: "550e8400-e29b-41d4-a716-446655440000",
          lastPosition: 120,
          completionPercent: 75,
          completed: false,
        };

        const result = validateInput(progressUpdateSchema, validData);
        expect(result).toEqual(validData);
      });

      it("should validate progress update with only required field", () => {
        const validData = {
          lessonId: "550e8400-e29b-41d4-a716-446655440000",
        };

        const result = validateInput(progressUpdateSchema, validData);
        expect(result).toEqual(validData);
      });

      it("should reject invalid lesson ID format", () => {
        const invalidData = {
          lessonId: "invalid-uuid",
        };

        expect(() => validateInput(progressUpdateSchema, invalidData)).toThrow();
      });

      it("should reject out of range values", () => {
        const invalidData = {
          lessonId: "550e8400-e29b-41d4-a716-446655440000",
          completionPercent: 150, // Over 100
        };

        expect(() => validateInput(progressUpdateSchema, invalidData)).toThrow();
      });
    });

    describe("certificateCheckSchema", () => {
      it("should validate certificate check request", () => {
        const validData = {
          courseId: "550e8400-e29b-41d4-a716-446655440000",
        };

        const result = validateInput(certificateCheckSchema, validData);
        expect(result).toEqual(validData);
      });

      it("should reject invalid course ID format", () => {
        const invalidData = {
          courseId: "invalid-course-id",
        };

        expect(() => validateInput(certificateCheckSchema, invalidData)).toThrow();
      });
    });

    describe("certificateDownloadSchema", () => {
      it("should validate certificate download request", () => {
        const validData = {
          certificateId: "CERT-1234567890-ABCDEF",
        };

        const result = validateInput(certificateDownloadSchema, validData);
        expect(result).toEqual(validData);
      });

      it("should reject invalid certificate ID format", () => {
        const invalidData = {
          certificateId: "invalid-cert-id",
        };

        expect(() => validateInput(certificateDownloadSchema, invalidData)).toThrow();
      });

      it("should reject certificate ID with lowercase letters", () => {
        const invalidData = {
          certificateId: "cert-1234567890-abcdef",
        };

        expect(() => validateInput(certificateDownloadSchema, invalidData)).toThrow();
      });
    });
  });
});
