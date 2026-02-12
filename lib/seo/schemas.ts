/**
 * JSON-LD structured data schema generators
 */

export interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

export interface CourseSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  provider: {
    "@type": string;
    name: string;
    url: string;
  };
  courseCode?: string;
  educationalLevel?: string;
  teaches?: string;
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  offers?: {
    "@type": string;
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}

export interface LearningPathSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  provider: {
    "@type": string;
    name: string;
    url: string;
  };
  hasPart?: Array<{
    "@type": string;
    name: string;
    url: string;
  }>;
}

export interface BreadcrumbListSchema {
  "@context": string;
  "@type": string;
  itemListElement: Array<{
    "@type": string;
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface WebSiteSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  description: string;
  publisher: {
    "@type": string;
    name: string;
    url: string;
  };
  potentialAction?: {
    "@type": string;
    target: string;
    "query-input": string;
  };
}

const siteUrl = process.env.NEXTAUTH_URL || "https://ai-genius-lab.vercel.app";

/**
 * Generate WebSite schema
 */
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI Genius Lab",
    url: siteUrl,
    description: "AI learning platform and digital product marketplace offering online courses, AI tools, and digital learning content.",
    publisher: {
      "@type": "Organization",
      name: "AI Genius Lab",
      url: siteUrl,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AI Genius Lab",
    url: siteUrl,
    description: "AI learning platform and digital product marketplace offering online courses, AI tools, and digital learning content.",
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      "https://github.com/SingasonSimon/AI-Genius-Lab",
      "https://twitter.com/aigeniuslab",
    ],
  };
}

/**
 * Generate Course schema
 */
export function generateCourseSchema(config: {
  name: string;
  description: string;
  url: string;
  priceCents?: number;
  courseCode?: string;
}): CourseSchema {
  const { name, description, url, priceCents, courseCode } = config;

  const schema: CourseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: "AI Genius Lab",
      url: siteUrl,
    },
    inLanguage: "en-US",
    isAccessibleForFree: false,
  };

  if (courseCode) {
    schema.courseCode = courseCode;
  }

  if (priceCents !== undefined) {
    schema.offers = {
      "@type": "Offer",
      price: (priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: url.startsWith("http") ? url : `${siteUrl}${url}`,
    };
  }

  return schema;
}

/**
 * Generate LearningPath schema
 */
export function generateLearningPathSchema(config: {
  name: string;
  description: string;
  url: string;
  courses?: Array<{ name: string; url: string }>;
}): LearningPathSchema {
  const { name, description, url, courses } = config;

  const schema: LearningPathSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: "AI Genius Lab",
      url: siteUrl,
    },
    url: url.startsWith("http") ? url : `${siteUrl}${url}`,
  };

  if (courses && courses.length > 0) {
    schema.hasPart = courses.map((course) => ({
      "@type": "Course",
      name: course.name,
      url: course.url.startsWith("http")
        ? course.url
        : `${siteUrl}${course.url}`,
    }));
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbListSchema(
  items: Array<{ name: string; url?: string }>
): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url && {
        item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
      }),
    })),
  };
}
