import Link from "next/link";
import { getPublishedCourses } from "@/lib/courses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Course Catalog
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Browse curated AI courses with previews and structured learning paths.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {course.description ?? "Course details coming soon."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/courses/${course.slug}`}>
                  <Button variant="outline" className="w-full">
                    View details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {courses.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No published courses yet. Seed data to preview the catalog.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
