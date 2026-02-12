/**
 * Integration tests for certificate and progress systems
 * Tests the complete flow from progress updates to certificate generation
 */

import { checkAndGenerateCertificate } from "@/lib/certificate-service";
import {
  cleanupCertificateCache,
  getCertificateCacheStatus,
} from "@/lib/certificate-service";
import {
  cleanupProgressCache,
  getCachedProgress,
  getProgressCacheStats,
  invalidateProgressCache,
  invalidateUserProgressCache,
  setCachedProgress,
  updateCachedLessonProgress,
} from "@/lib/progress-cache";
import { validateRequestBody, progressUpdateSchema, certificateCheckSchema } from "@/lib/validation";

// Mock dependencies
jest.mock("@/lib/certificates");
jest.mock("@/lib/logger");

describe("Certificate & Progress Integration", () => {
  const userId = "test-user-123";
  const courseId = "test-course-123";
  const lessonId = "test-lesson-123";

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear caches
    cleanupCertificateCache();
  });

  describe("Complete Progress Flow", () => {
    it("should handle the complete flow from progress update to certificate generation", async () => {
      // Step 1: Validate progress update input
      const progressData = {
        lessonId,
        completionPercent: 100,
        completed: true,
        lastPosition: 300,
      };

      const validationResult = validateRequestBody(progressUpdateSchema, progressData);
      expect(validationResult.success).toBe(true);
      if (validationResult.success) {
        expect(validationResult.data).toEqual(progressData);
      }

      // Step 2: Cache initial progress
      const initialProgress = {
        totalLessons: 5,
        completedLessons: 3,
        overallProgress: 60,
        lessons: [
          { lessonId: "lesson-1", completedAt: "2023-01-01T00:00:00Z", completionPercent: 100, lastPosition: 0 },
          { lessonId: "lesson-2", completedAt: "2023-01-01T00:00:00Z", completionPercent: 100, lastPosition: 0 },
          { lessonId: "lesson-3", completedAt: "2023-01-01T00:00:00Z", completionPercent: 100, lastPosition: 0 },
          { lessonId: lessonId, completedAt: null, completionPercent: 0, lastPosition: 0 },
          { lessonId: "lesson-5", completedAt: null, completionPercent: 0, lastPosition: 0 },
        ],
        isCompleted: false,
        lastUpdated: Date.now(),
      };

      setCachedProgress(userId, courseId, initialProgress);
      expect(getCachedProgress(userId, courseId)).toEqual(initialProgress);

      // Step 3: Update lesson progress in cache
      updateCachedLessonProgress(userId, courseId, lessonId, {
        completedAt: new Date().toISOString(),
        completionPercent: 100,
        lastPosition: 300,
      });

      const updatedProgress = getCachedProgress(userId, courseId);
      expect(updatedProgress).toBeTruthy();
      expect(updatedProgress?.completedLessons).toBe(4);
      expect(updatedProgress?.overallProgress).toBe(80);

      // Step 4: Simulate course completion and certificate check
      const { hasCompletedCourse } = await import("@/lib/certificates");
      (hasCompletedCourse as jest.Mock).mockResolvedValue(true);

      const { generateCourseCertificate } = await import("@/lib/certificates");
      const mockCertificate = {
        id: "cert-123",
        certificateId: "CERT-1234567890-ABCDEF",
        userId,
        courseId,
        type: "course" as const,
        issuedAt: new Date(),
      };
      (generateCourseCertificate as jest.Mock).mockResolvedValue(mockCertificate);

      // Step 5: Check and generate certificate
      const certificateResult = await checkAndGenerateCertificate(userId, courseId);
      
      expect(certificateResult.success).toBe(true);
      expect(certificateResult.certificateId).toBe(mockCertificate.certificateId);
      expect(certificateResult.newlyGenerated).toBe(true);

      // Step 6: Verify deduplication works
      const duplicateResult = await checkAndGenerateCertificate(userId, courseId);
      expect(duplicateResult).toEqual(certificateResult);
      expect(generateCourseCertificate).toHaveBeenCalledTimes(1);
    });

    it("should handle validation errors properly", () => {
      // Test invalid progress data
      const invalidProgress = {
        lessonId: "invalid-uuid",
        completionPercent: 150, // Over 100
        completed: true,
      };

      const validation = validateRequestBody(progressUpdateSchema, invalidProgress);
      expect(validation.success).toBe(false);
      if (!validation.success) {
        expect(validation.response).toBeInstanceOf(Response);
        expect(validation.response.status).toBe(400);
      }

      // Test invalid certificate check data
      const invalidCertificateData = {
        courseId: "invalid-course-id",
      };

      const certValidation = validateRequestBody(certificateCheckSchema, invalidCertificateData);
      expect(certValidation.success).toBe(false);
    });

    it("should handle cache invalidation correctly", () => {
      // Set up cached progress
      const progress = {
        totalLessons: 3,
        completedLessons: 1,
        overallProgress: 33,
        lessons: [
          { lessonId: "lesson-1", completedAt: "2023-01-01T00:00:00Z", completionPercent: 100, lastPosition: 0 },
          { lessonId: "lesson-2", completedAt: null, completionPercent: 0, lastPosition: 0 },
          { lessonId: "lesson-3", completedAt: null, completionPercent: 0, lastPosition: 0 },
        ],
        isCompleted: false,
        lastUpdated: Date.now(),
      };

      setCachedProgress(userId, courseId, progress);
      expect(getCachedProgress(userId, courseId)).toBeTruthy();

      // Invalidate specific course cache
      invalidateProgressCache(userId, courseId);
      expect(getCachedProgress(userId, courseId)).toBeNull();

      // Test user-wide cache invalidation
      setCachedProgress(userId, courseId, progress);
      setCachedProgress(userId, "another-course", progress);
      
      invalidateUserProgressCache(userId);
      expect(getCachedProgress(userId, courseId)).toBeNull();
      expect(getCachedProgress(userId, "another-course")).toBeNull();
    });

    it("should handle certificate generation failures gracefully", async () => {
      const { hasCompletedCourse } = await import("@/lib/certificates");
      (hasCompletedCourse as jest.Mock).mockResolvedValue(true);

      const { generateCourseCertificate } = await import("@/lib/certificates");
      const error = new Error("PDF generation failed");
      (generateCourseCertificate as jest.Mock).mockRejectedValue(error);

      const result = await checkAndGenerateCertificate(userId, courseId);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe("Course completed but certificate generation failed");
      expect(result.error).toBe("PDF generation failed");
    });

    it("should handle course not completed scenario", async () => {
      const { hasCompletedCourse } = await import("@/lib/certificates");
      (hasCompletedCourse as jest.Mock).mockResolvedValue(false);

      const result = await checkAndGenerateCertificate(userId, courseId);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("Course not yet completed");
      expect(result.isCompleted).toBe(false);
    });
  });

  describe("Cache Performance", () => {
    it("should provide cache statistics", () => {
      // Initially empty
      const certStats = getCertificateCacheStatus();
      expect(certStats.totalEntries).toBe(0);
      expect(certStats.activeGenerations).toBe(0);

      const progressStats = getProgressCacheStats();
      expect(progressStats.totalEntries).toBe(0);
      expect(progressStats.completedCourses).toBe(0);
      expect(progressStats.activeCourses).toBe(0);
    });

    it("should handle cache cleanup", () => {
      // Should not throw errors
      expect(() => cleanupCertificateCache()).not.toThrow();
      expect(() => cleanupProgressCache()).not.toThrow();
    });
  });
});
