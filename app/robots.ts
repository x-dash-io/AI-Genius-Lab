import { MetadataRoute } from "next";

const siteUrl = process.env.NEXTAUTH_URL || "https://synapze.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/library/",
          "/api/",
          "/sign-in",
          "/sign-up",
          "/checkout",
          "/activity",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
