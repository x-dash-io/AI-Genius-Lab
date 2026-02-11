/**
 * Unit tests for certificate service utility functions
 * These functions don't use "use server" and can be tested in Jest
 */

// Mock the analytics module to prevent ES module issues
jest.mock("@/lib/analytics", () => ({
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
  trackPurchase: jest.fn(),
  trackCourseView: jest.fn(),
  trackLessonComplete: jest.fn(),
}));

// Mock all the certificate-related modules to prevent ES module issues
jest.mock("@/lib/certificates", () => ({
  hasCompletedCourse: jest.fn(),
  generateCourseCertificate: jest.fn(),
  getUserCertificates: jest.fn(),
  getCertificateById: jest.fn(),
}));

// Mock the logger module
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock the access module
jest.mock("@/lib/access", () => ({
  requireUser: jest.fn(),
  requireCustomer: jest.fn(),
  isAdmin: jest.fn(),
}));

import { cleanupCertificateCache, getCertificateCacheStatus } from "@/lib/certificate-service";

describe("Certificate Service Utilities", () => {
  beforeEach(() => {
    // Clear the cache before each test
    cleanupCertificateCache();
  });

  describe("cache management", () => {
    it("should track cache status correctly", () => {
      // Initially cache should be empty
      const status = getCertificateCacheStatus();
      expect(status.totalEntries).toBe(0);
      expect(status.activeGenerations).toBe(0);
      expect(status.entries).toHaveLength(0);
    });

    it("should clean up expired cache entries", () => {
      // This test verifies the cleanup function doesn't throw
      expect(() => cleanupCertificateCache()).not.toThrow();
      
      // After cleanup, cache should still be empty
      const status = getCertificateCacheStatus();
      expect(status.totalEntries).toBe(0);
    });

    it("should return correct cache structure", () => {
      const status = getCertificateCacheStatus();
      
      // Verify the structure of the returned object
      expect(status).toHaveProperty('totalEntries');
      expect(status).toHaveProperty('activeGenerations');
      expect(status).toHaveProperty('entries');
      expect(Array.isArray(status.entries)).toBe(true);
      expect(typeof status.totalEntries).toBe('number');
      expect(typeof status.activeGenerations).toBe('number');
    });
  });
});
