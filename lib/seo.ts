import { Metadata } from "next";
import { siteConfig } from "./config";

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  noindex?: boolean;
  nofollow?: boolean;
  authors?: { name: string }[];
  applicationName?: string;
  metadataBase?: string;
}

const defaultTitle = `${siteConfig.name} - Master AI With Curated Learning Paths`;
const defaultDescription = siteConfig.description;
const defaultImage = siteConfig.ogImage;
const siteUrl = siteConfig.url;

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
    authors = [],
    applicationName = siteConfig.name,
    metadataBase = siteConfig.url,
  } = config;

  const fullTitle = title
    ? `${title} | AI Genius Lab`
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
    authors: authors.length > 0 ? authors : [{ name: "AI Genius Lab" }],
    robots: robots.join(", "),
    applicationName,
    metadataBase: new URL(metadataBase),
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: "AI Genius Lab",
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
      creator: "@aigeniuslab",
      site: "@aigeniuslab",
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

  const fullTitle = title.includes("|") ? title : `${title} | AI Genius Lab`;
  const fullImage = image.startsWith("http") ? image : `${siteUrl}${image}`;
  const fullUrl = url.startsWith("http") ? url : `${siteUrl}${url}`;

  return {
    "og:title": fullTitle,
    "og:description": description,
    "og:image": fullImage,
    "og:url": fullUrl,
    "og:type": type,
    "og:site_name": "AI Genius Lab",
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

  const fullTitle = title.includes("|") ? title : `${title} | AI Genius Lab`;
  const fullImage = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return {
    "twitter:card": "summary_large_image",
    "twitter:title": fullTitle,
    "twitter:description": description,
    "twitter:image": fullImage,
  };
}
