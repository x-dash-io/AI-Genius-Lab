/**
 * HTML sanitization utilities for user-generated content
 * 
 * NOTE: For production, consider using DOMPurify or sanitize-html
 * Install: npm install dompurify isomorphic-dompurify
 */

/**
 * Basic HTML sanitization - removes script tags and dangerous attributes
 * For production, replace with DOMPurify or similar library
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");
  
  // Remove data: URLs that could be dangerous
  sanitized = sanitized.replace(/data:(?!image\/[png|jpg|jpeg|gif|webp])/gi, "");
  
  return sanitized.trim();
}

/**
 * Sanitize plain text - removes HTML tags
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Remove HTML tags
  return text.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize blog post content
 */
export function sanitizeBlogContent(content: string): string {
  return sanitizeHtml(content);
}

/**
 * Sanitize review text
 */
export function sanitizeReviewText(text: string | null | undefined): string {
  if (!text) {
    return "";
  }
  // Reviews should be plain text, remove any HTML
  return sanitizeText(text);
}

/**
 * Sanitize user input for display
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Escape HTML entities
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
