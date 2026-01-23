"use client";

import { useEffect } from "react";

/**
 * Aggressively removes Next.js development indicator
 * Uses MutationObserver to catch dynamically injected elements
 * This is needed because Next.js injects it in development mode
 */
export function DevIndicatorRemover() {
  useEffect(() => {
    const removeDevIndicator = () => {
      // All possible selectors for Next.js dev indicator
      const selectors = [
        '#__next-build-watcher',
        '#__next-dev-overlay',
        '[data-nextjs-dialog]',
        '[data-nextjs-dialog-overlay]',
        '[data-nextjs-toast]',
        '[data-nextjs-toast-root]',
        '[data-nextjs-dialog-portal]',
        '[data-nextjs-dialog-backdrop]',
        'div[data-nextjs-dialog]',
        'div[data-nextjs-dialog-overlay]',
        'div[data-nextjs-toast]',
        'button[data-nextjs-dialog-close]',
        'button[data-nextjs-toast-close]',
        // Catch any element with Next.js specific classes/ids
        '[id*="__next"]',
        '[id*="nextjs"]',
        '[class*="__next"]',
        '[class*="nextjs"]',
        // Specific to the "N" icon button
        'button[aria-label*="Next.js"]',
        'div[aria-label*="Next.js"]',
        'a[aria-label*="Next.js"]',
      ];

      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el) {
              // Remove from DOM
              el.remove();
              // Force hide with inline styles
              (el as HTMLElement).style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; position: fixed !important; z-index: -9999 !important; width: 0 !important; height: 0 !important; overflow: hidden !important;';
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });

      // Also check for elements by scanning all elements
      try {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const id = el.id || '';
          const className = el.className?.toString() || '';
          const ariaLabel = el.getAttribute('aria-label') || '';
          
          if (
            (id.includes('__next') || id.includes('nextjs')) ||
            (typeof className === 'string' && (className.includes('__next') || className.includes('nextjs'))) ||
            ariaLabel.includes('Next.js')
          ) {
            el.remove();
            (el as HTMLElement).style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
          }
        });
      } catch (e) {
        // Ignore errors
      }
    };

    // Run immediately
    removeDevIndicator();

    // Use MutationObserver to catch dynamically added elements
    const observer = new MutationObserver((mutations) => {
      let shouldRemove = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const id = el.id || '';
            const className = el.className?.toString() || '';
            const ariaLabel = el.getAttribute('aria-label') || '';
            
            if (
              id.includes('__next') ||
              id.includes('nextjs') ||
              className.includes('__next') ||
              className.includes('nextjs') ||
              ariaLabel.includes('Next.js') ||
              el.hasAttribute('data-nextjs-dialog') ||
              el.hasAttribute('data-nextjs-toast')
            ) {
              shouldRemove = true;
            }
          }
        });
      });
      
      if (shouldRemove) {
        removeDevIndicator();
      }
    });

    // Observe the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id', 'class', 'data-nextjs-dialog', 'data-nextjs-toast', 'aria-label'],
    });

    // Also intercept script tags that might create it
    const scriptObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            const script = node as HTMLScriptElement;
            if (script.src && (script.src.includes('__next') || script.src.includes('nextjs'))) {
              script.remove();
            }
            if (script.textContent && (script.textContent.includes('__next-build-watcher') || 
                script.textContent.includes('__next-dev-overlay'))) {
              script.remove();
            }
          }
        });
      });
    });

    scriptObserver.observe(document.head, {
      childList: true,
      subtree: true,
    });

    // Also run periodically as a fallback - very frequent
    const interval = setInterval(removeDevIndicator, 100);

    // Cleanup
    return () => {
      observer.disconnect();
      scriptObserver.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}
