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
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
  const hideDevOverlay = process.env.HIDE_NEXT_DEV_OVERLAY === "true";

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
                  {hideDevOverlay ? <DevIndicatorRemover /> : null}
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

        {hideDevOverlay ? (
          <style
            dangerouslySetInnerHTML={{
              __html: `
                #__next-build-watcher,
                #__next-dev-overlay,
                [data-nextjs-dialog],
                [data-nextjs-dialog-overlay],
                [data-nextjs-toast],
                [data-nextjs-toast-root] {
                  display: none !important;
                  visibility: hidden !important;
                  opacity: 0 !important;
                  pointer-events: none !important;
                }
              `,
            }}
          />
        ) : null}
      </body>
    </html>
  );
}
