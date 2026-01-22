import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedCoursesByCategory } from "@/lib/courses";
import { CourseList } from "@/components/courses/CourseList";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

const categoryNames: Record<string, string> = {
  business: "Make Money & Business",
  content: "Create Content & Video",
  marketing: "Marketing & Traffic",
  apps: "Build Apps & Tech",
  productivity: "Productivity & Tools",
};

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryName = categoryNames[category] || category;

  return generateSEOMetadata({
    title: `${categoryName} Courses`,
    description: `Browse ${categoryName.toLowerCase()} AI courses. Learn how to use AI for ${categoryName.toLowerCase()}.`,
    keywords: [categoryName, "AI courses", "online learning"],
    url: `/courses/category/${category}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!categoryNames[category]) {
    notFound();
  }

  const courses = await getPublishedCoursesByCategory(category);
  const categoryName = categoryNames[category];

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {categoryName} Courses
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse curated AI courses for {categoryName.toLowerCase()}.
        </p>
      </div>
      <CourseList courses={courses} />
    </section>
  );
}
