"use client";

import { useEffect } from "react";

/**
 * Removes only known Next.js development indicator elements.
 * Intentionally narrow and one-shot to avoid hiding unrelated UI.
 */
export function DevIndicatorRemover() {
  useEffect(() => {
    const selectors = [
      "#__next-build-watcher",
      "#__next-dev-overlay",
      "[data-nextjs-dialog]",
      "[data-nextjs-dialog-overlay]",
      "[data-nextjs-toast]",
      "[data-nextjs-toast-root]",
    ];

    const removeDevIndicator = () => {
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          el.remove();
        });
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", removeDevIndicator, { once: true });
    } else {
      removeDevIndicator();
    }
  }, []);

  return null;
}
