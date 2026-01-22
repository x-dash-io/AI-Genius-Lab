/**
 * Analytics and monitoring utilities
 * For production, integrate with services like:
 * - Vercel Analytics
 * - Google Analytics
 * - Plausible
 * - Custom analytics service
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
}

/**
 * Track analytics events
 */
export function trackEvent(event: AnalyticsEvent): void {
  // In development, log events
  if (process.env.NODE_ENV === "development") {
    console.log("📊 Analytics Event:", event);
    return;
  }

  // For production, send to analytics service
  // Example with Vercel Analytics:
  // import { track } from '@vercel/analytics';
  // track(event.name, event.properties);

  // Example with custom endpoint:
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(event),
  // }).catch(console.error);
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
