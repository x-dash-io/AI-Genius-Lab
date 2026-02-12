/**
 * SF Pro Font Loading Utility
 * Ensures SF Pro fonts are properly loaded and enforced across all devices
 */

export class FontLoader {
  private static instance: FontLoader;
  private isLoaded = false;
  private loadAttempts = 0;
  private maxAttempts = 3;

  private constructor() {}

  private getExtendedStyle(element: HTMLElement): CSSStyleDeclaration & {
    webkitFontSmoothing?: string;
    MozOsxFontSmoothing?: string;
    webkitTextSizeAdjust?: string;
    MozTextSizeAdjust?: string;
    textSizeAdjust?: string;
  } {
    return element.style as CSSStyleDeclaration & {
      webkitFontSmoothing?: string;
      MozOsxFontSmoothing?: string;
      webkitTextSizeAdjust?: string;
      MozTextSizeAdjust?: string;
      textSizeAdjust?: string;
    };
  }

  static getInstance(): FontLoader {
    if (!FontLoader.instance) {
      FontLoader.instance = new FontLoader();
    }
    return FontLoader.instance;
  }

  /**
   * Check if SF Pro fonts are available on the system
   */
  private async checkSFProAvailability(): Promise<boolean> {
    const testText = 'The quick brown fox jumps over the lazy dog';
    const testFonts = [
      'SF Pro Display',
      'SF Pro Text',
      'SF Pro Display Regular',
      'SF Pro Text Regular'
    ];

    for (const font of testFonts) {
      if (await this.isFontAvailable(font, testText)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a specific font is available
   */
  private async isFontAvailable(font: string, testText: string): Promise<boolean> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        resolve(false);
        return;
      }

      // Test with the target font
      context.font = `72px ${font}`;
      const targetWidth = context.measureText(testText).width;

      // Test with fallback font
      context.font = `72px monospace`;
      const fallbackWidth = context.measureText(testText).width;

      // If widths are different, font is available
      resolve(targetWidth !== fallbackWidth);
    });
  }

  /**
   * Load SF Pro fonts with fallback to system fonts
   */
  async loadSFProFonts(): Promise<void> {
    if (this.isLoaded || this.loadAttempts >= this.maxAttempts) {
      return;
    }

    this.loadAttempts++;

    try {
      // Check if SF Pro fonts are available
      const sfProAvailable = await this.checkSFProAvailability();

      if (sfProAvailable) {
        // Load SF Pro fonts using Font Face API
        if ('fonts' in document) {
          await Promise.all([
            document.fonts.load('400 1em SF Pro Display'),
            document.fonts.load('400 1em SF Pro Text'),
            document.fonts.load('600 1em SF Pro Display'),
            document.fonts.load('600 1em SF Pro Text'),
            document.fonts.load('700 1em SF Pro Display'),
            document.fonts.load('700 1em SF Pro Text')
          ]);
        }

        this.isLoaded = true;
        this.applySFProFonts();
        console.log('SF Pro fonts loaded successfully');
      } else {
        // Use system fonts as fallback
        console.log('SF Pro fonts not available, using system fonts');
        this.applySystemFonts();
      }
    } catch (error) {
      console.error('Error loading SF Pro fonts:', error);
      this.applySystemFonts();
    }
  }

  /**
   * Apply SF Pro fonts to the document
   */
  private applySFProFonts(): void {
    const root = document.documentElement;
    
    // Set CSS variables
    root.style.setProperty('--font-sf-pro-display', "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif");
    root.style.setProperty('--font-sf-pro-text', "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif");
    root.style.setProperty('--font-sf-pro', "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif");

    // Apply to body
    document.body.style.fontFamily = 'var(--font-sf-pro)';
    document.body.classList.add('sf-pro-loaded');

    // Apply to all elements
    this.enforceFontsOnAllElements();
  }

  /**
   * Apply system fonts as fallback
   */
  private applySystemFonts(): void {
    const root = document.documentElement;
    
    // Set CSS variables to system fonts
    root.style.setProperty('--font-sf-pro-display', "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif");
    root.style.setProperty('--font-sf-pro-text', "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif");
    root.style.setProperty('--font-sf-pro', "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif");

    // Apply to body
    document.body.style.fontFamily = 'var(--font-sf-pro)';
    document.body.classList.add('sf-pro-loaded');

    // Apply to all elements
    this.enforceFontsOnAllElements();
  }

  /**
   * Enforce fonts on all elements
   */
  private enforceFontsOnAllElements(): void {
    const elements = document.querySelectorAll('*');
    
    elements.forEach(el => {
      if (el.nodeType === Node.ELEMENT_NODE) {
        const element = el as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        // Skip code elements
        if (['code', 'pre', 'kbd', 'samp'].includes(tagName)) {
          return;
        }

        // Apply font family
        element.style.fontFamily = 'var(--font-sf-pro)';
        const extendedStyle = this.getExtendedStyle(element);
        
        // Apply font smoothing using correct property names
        extendedStyle.webkitFontSmoothing = 'antialiased';
        extendedStyle.MozOsxFontSmoothing = 'grayscale';
        element.style.textRendering = 'optimizeLegibility';
        
        // Prevent text size adjustment using correct property names
        extendedStyle.webkitTextSizeAdjust = '100%';
        extendedStyle.MozTextSizeAdjust = '100%';
        extendedStyle.textSizeAdjust = '100%';
      }
    });
  }

  /**
   * Initialize font loading
   */
  async initialize(): Promise<void> {
    // Load fonts immediately
    await this.loadSFProFonts();

    // Set up observer for dynamic content
    this.setupMutationObserver();

    // Set up periodic enforcement
    this.setupPeriodicEnforcement();

    // Handle visibility changes
    this.setupVisibilityHandler();
  }

  /**
   * Set up mutation observer for dynamic content
   */
  private setupMutationObserver(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.enforceFontsOnAllElements();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  /**
   * Set up periodic font enforcement
   */
  private setupPeriodicEnforcement(): void {
    setInterval(() => {
      this.enforceFontsOnAllElements();
    }, 2000);
  }

  /**
   * Set up visibility change handler
   */
  private setupVisibilityHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.enforceFontsOnAllElements();
      }
    });

    // Handle page focus
    window.addEventListener('focus', () => {
      this.enforceFontsOnAllElements();
    });
  }

  /**
   * Get current font status
   */
  getStatus(): { loaded: boolean; attempts: number; sfProAvailable: boolean } {
    return {
      loaded: this.isLoaded,
      attempts: this.loadAttempts,
      sfProAvailable: document.body.classList.contains('sf-pro-loaded')
    };
  }
}

// Export singleton instance
export const fontLoader = FontLoader.getInstance();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fontLoader.initialize();
    });
  } else {
    fontLoader.initialize();
  }
}
