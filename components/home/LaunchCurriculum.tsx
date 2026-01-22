import Link from "next/link";
import { getPublishedCourses } from "@/lib/courses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Video, Megaphone, Code, Zap, ShieldCheck } from "lucide-react";

const categories = [
  {
    id: "business",
    name: "Make Money & Business",
    icon: DollarSign,
    description: "Learn how AI actually generates income",
    cta: "View Business Courses",
    href: "/courses/category/business",
  },
  {
    id: "content",
    name: "Create Content & Video",
    icon: Video,
    description: "Automate creativity with AI",
    cta: "Explore Content Courses",
    href: "/courses/category/content",
  },
  {
    id: "marketing",
    name: "Marketing & Traffic",
    icon: Megaphone,
    description: "Scale reach, sales, and conversions",
    cta: "Grow With AI Marketing",
    href: "/courses/category/marketing",
  },
  {
    id: "apps",
    name: "Build Apps & Tech",
    icon: Code,
    description: "From no-code to AI agents",
    cta: "Build With AI",
    href: "/courses/category/apps",
  },
  {
    id: "productivity",
    name: "Productivity & Tools",
    icon: Zap,
    description: "Work faster with AI assistants",
    cta: "Boost Productivity",
    href: "/courses/category/productivity",
  },
];

export async function LaunchCurriculum() {
  const courses = await getPublishedCourses();

  return (
    <section className="grid gap-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Launch Curriculum
        </h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Courses organized by outcomes, not creators
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;
          // Filter courses by category when category field is added
          // For now, show all courses or empty state
          const categoryCourses = courses.filter(
            (course) => (course as any).category === category.id
          );

          return (
            <Card key={category.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                {categoryCourses.length > 0 ? (
                  <div className="grid gap-2">
                    {categoryCourses.slice(0, 3).map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {course.title}
                      </Link>
                    ))}
                    {categoryCourses.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{categoryCourses.length - 3} more courses
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Courses coming soon
                  </p>
                )}
                <div className="mt-auto pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Courses unlocked instantly after purchase
                    </span>
                  </div>
                  <Link href={categoryCourses.length > 0 ? category.href : "/courses"}>
                    <Button variant="outline" className="w-full" size="sm">
                      {category.cta} →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
