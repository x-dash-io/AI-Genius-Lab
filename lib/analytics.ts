/**
 * Analytics and monitoring utilities
 * Integrated with Vercel Analytics and Google Analytics (optional)
 */

import { track as vercelTrack } from "@vercel/analytics";

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
}

/**
 * Track analytics events
 * Uses Vercel Analytics for automatic tracking
 * Optionally sends to Google Analytics if GA_MEASUREMENT_ID is set
 */
export function trackEvent(event: AnalyticsEvent): void {
  // Always log in development
  if (process.env.NODE_ENV === "development") {
    console.log("[ANALYTICS] Event:", event);
  }

  // Track with Vercel Analytics (works in production automatically)
  try {
    vercelTrack(event.name, event.properties);
  } catch (error) {
    console.error("[ANALYTICS] Failed to track with Vercel:", error);
  }

  // Track with Google Analytics if configured (client-side only)
  if (typeof window !== "undefined" && (window as any).gtag) {
    try {
      (window as any).gtag("event", event.name, {
        ...event.properties,
        user_id: event.userId,
      });
    } catch (error) {
      console.error("[ANALYTICS] Failed to track with Google Analytics:", error);
    }
  }
}

/**
 * Track page views
 */
export function trackPageView(path: string, userId?: string): void {
  trackEvent({
    name: "page_view",
    properties: { path },
    userId,
  });
}

/**
 * Track purchases
 */
export function trackPurchase(
  courseId: string,
  amountCents: number,
  userId: string
): void {
  trackEvent({
    name: "purchase",
    properties: {
      courseId,
      amount: amountCents / 100,
      currency: "USD",
    },
    userId,
  });
}

/**
 * Track course views
 */
export function trackCourseView(courseId: string, userId?: string): void {
  trackEvent({
    name: "course_view",
    properties: { courseId },
    userId,
  });
}

/**
 * Track lesson completion
 */
export function trackLessonComplete(
  lessonId: string,
  courseId: string,
  userId: string
): void {
  trackEvent({
    name: "lesson_complete",
    properties: { lessonId, courseId },
    userId,
  });
}
