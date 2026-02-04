import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import { DevIndicatorRemover } from "@/components/DevIndicatorRemover";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo/schemas";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// const montserrat = Montserrat({
//   subsets: ["latin"],
//   variable: "--font-montserrat",
//   weight: ["400", "500", "600", "700"],
//   display: "swap",
// });

export const metadata: Metadata = generateSEOMetadata({
  title: "AI Genius Lab",
  description:
    "Learn AI for business, content, apps, and productivity through structured courses, tracked progress, and instant access after purchase.",
  keywords: [
    "AI courses",
    "artificial intelligence",
    "online learning",
    "structured learning",
    "AI education",
    "machine learning courses",
    "AI training",
    "AI learning platform",
    "digital product marketplace",
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteSchema),
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{
          fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          fontFeatureSettings: '"liga" 0, "calt" 0',
        }}
      >
        <ThemeProvider>
          <SessionProvider>
            <CartProvider>
              <ConfirmDialogProvider>
                <ToastProvider>
                  <DevIndicatorRemover />
                  <Suspense fallback={null}>
                    {children}
                  </Suspense>
                </ToastProvider>
              </ConfirmDialogProvider>
            </CartProvider>
          </SessionProvider>
        </ThemeProvider>
        <Analytics />

        {/* Disable ligatures globally */}
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              font-feature-settings: "liga" 0, "calt" 0 !important;
              -webkit-font-feature-settings: "liga" 0, "calt" 0 !important;
              -moz-font-feature-settings: "liga" 0, "calt" 0 !important;
            }
          `
        }} />

        {/* Hide Next.js development indicator - works in both dev and production */}
        <style dangerouslySetInnerHTML={{
          __html: `
            #__next-build-watcher,
            #__next-dev-overlay,
            [data-nextjs-dialog],
            [data-nextjs-dialog-overlay],
            [data-nextjs-toast],
            [data-nextjs-toast-close-button],
            [data-nextjs-toast-root],
            [data-nextjs-dialog-portal],
            [data-nextjs-dialog-backdrop],
            div[data-nextjs-dialog],
            div[data-nextjs-dialog-overlay],
            div[data-nextjs-toast],
            div[id*="__next"],
            div[id*="nextjs"],
            div[class*="__next"],
            div[class*="nextjs"],
            button[data-nextjs-dialog-close],
            button[data-nextjs-toast-close] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
              position: fixed !important;
              z-index: -9999 !important;
              width: 0 !important;
              height: 0 !important;
              overflow: hidden !important;
            }
          `
        }} />
        {/* Client-side script to remove dev indicator */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              function removeDevIndicator() {
                const selectors = [
                  '#__next-build-watcher',
                  '#__next-dev-overlay',
                  '[data-nextjs-dialog]',
                  '[data-nextjs-dialog-overlay]',
                  '[data-nextjs-toast]',
                  '[data-nextjs-toast-root]'
                ];
                selectors.forEach(selector => {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(el => {
                    if (el) {
                      el.remove();
                      el.style.display = 'none';
                      el.style.visibility = 'hidden';
                      el.style.opacity = '0';
                      el.style.pointerEvents = 'none';
                    }
                  });
                });
              }
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', removeDevIndicator);
              } else {
                removeDevIndicator();
              }
              // Also run periodically to catch dynamically added elements
              setInterval(removeDevIndicator, 1000);
            })();
          `
        }} />
      </body>
    </html>
  );
}
