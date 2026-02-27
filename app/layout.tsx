import type { Metadata } from "next";
import { Suspense } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { UiPreferencesProvider } from "@/components/providers/UiPreferencesProvider";
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
  viewportFit: "cover",
};

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

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
    <html
      lang="en"
      suppressHydrationWarning
      data-reduced-motion="false"
    >
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
      <body className={`${manrope.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider>
          <UiPreferencesProvider>
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
          </UiPreferencesProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
