import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedCoursesByCategory } from "@/lib/courses";
import { getCategoryBySlug } from "@/lib/categories";
import { CourseList } from "@/components/courses/CourseList";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryData = await getCategoryBySlug(category);
  const categoryName = categoryData?.name || category;

  return generateSEOMetadata({
    title: `${categoryName} Courses`,
    description: categoryData?.description || `Browse ${categoryName.toLowerCase()} AI courses. Learn how to use AI for ${categoryName.toLowerCase()}.`,
    keywords: [categoryName, "AI courses", "online learning"],
    url: `/courses/category/${category}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = await getCategoryBySlug(category);

  if (!categoryData || !categoryData.isActive) {
    notFound();
  }

  const courses = await getPublishedCoursesByCategory(category);

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {categoryData.name} Courses
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {categoryData.description || `Browse curated AI courses for ${categoryData.name.toLowerCase()}.`}
        </p>
      </div>
      <CourseList courses={courses} />
    </section>
  );
}
