import { MetadataRoute } from "next";
import { getPublishedCourses } from "@/lib/courses";
import { getAllPublishedLearningPaths } from "@/lib/learning-paths";

const siteUrl = process.env.NEXTAUTH_URL || "https://synapze.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let courses: any[] = [];
  let learningPaths: any[] = [];

  try {
    courses = await getPublishedCourses();
    learningPaths = await getAllPublishedLearningPaths();
  } catch (error) {
    console.error("Failed to fetch dynamic sitemap entries:", error);
  }

  const courseEntries: MetadataRoute.Sitemap = courses.map((course: any) => ({
    url: `${siteUrl}/courses/${course.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const learningPathEntries: MetadataRoute.Sitemap = learningPaths.map((path: any) => ({
    url: `${siteUrl}/learning-paths/${path.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/learning-paths`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  return [...staticPages, ...courseEntries, ...learningPathEntries];
}
