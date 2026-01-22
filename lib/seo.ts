import { Metadata } from "next";

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "course";
  noindex?: boolean;
  nofollow?: boolean;
}

const defaultTitle = "Synapze - Master AI With Curated Learning Paths";
const defaultDescription =
  "Learn AI for business, content, apps, and productivity through structured courses, tracked progress, and instant access after purchase.";
const defaultImage = "/og-image.jpg";
const siteUrl = process.env.NEXTAUTH_URL || "https://synapze.dev";

/**
 * Generate metadata for a page
 */
export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title,
    description = defaultDescription,
    keywords = [],
    image = defaultImage,
    url,
    type = "website",
    noindex = false,
    nofollow = false,
  } = config;

  const fullTitle = title
    ? `${title} | Synapze`
    : defaultTitle;

  const fullImage = image.startsWith("http")
    ? image
    : `${siteUrl}${image}`;

  const fullUrl = url
    ? url.startsWith("http")
      ? url
      : `${siteUrl}${url}`
    : siteUrl;

  const robots = [];
  if (noindex) robots.push("noindex");
  if (nofollow) robots.push("nofollow");
  if (robots.length === 0) robots.push("index", "follow");

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
    robots: robots.join(", "),
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: "Synapze",
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [fullImage],
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

/**
 * Generate Open Graph tags
 */
export function generateOpenGraph(config: SEOConfig) {
  const {
    title = defaultTitle,
    description = defaultDescription,
    image = defaultImage,
    url = siteUrl,
    type = "website",
  } = config;

  const fullTitle = title.includes("|") ? title : `${title} | Synapze`;
  const fullImage = image.startsWith("http") ? image : `${siteUrl}${image}`;
  const fullUrl = url.startsWith("http") ? url : `${siteUrl}${url}`;

  return {
    "og:title": fullTitle,
    "og:description": description,
    "og:image": fullImage,
    "og:url": fullUrl,
    "og:type": type,
    "og:site_name": "Synapze",
    "og:locale": "en_US",
  };
}

/**
 * Generate Twitter Card tags
 */
export function generateTwitterCard(config: SEOConfig) {
  const {
    title = defaultTitle,
    description = defaultDescription,
    image = defaultImage,
  } = config;

  const fullTitle = title.includes("|") ? title : `${title} | Synapze`;
  const fullImage = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return {
    "twitter:card": "summary_large_image",
    "twitter:title": fullTitle,
    "twitter:description": description,
    "twitter:image": fullImage,
  };
}
