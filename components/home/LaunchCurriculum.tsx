import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Video, Megaphone, Code, Zap, ShieldCheck, Sparkles } from "lucide-react";
import type { HomepageStats } from "@/lib/homepage-stats";

// Default icon mapping for common category names
const iconMap: Record<string, any> = {
  business: DollarSign,
  content: Video,
  marketing: Megaphone,
  apps: Code,
  productivity: Zap,
  default: Sparkles,
};

function getCategoryIcon(categoryName: string) {
  const key = categoryName.toLowerCase();
  return iconMap[key] || iconMap.default;
}

interface LaunchCurriculumProps {
  stats: HomepageStats;
}

export function LaunchCurriculum({ stats }: LaunchCurriculumProps) {
  const { categoriesWithCourses } = stats;

  // Show message if no categories with courses
  if (categoriesWithCourses.length === 0) {
    return (
      <section className="grid gap-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Course Catalog
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Courses organized by outcomes, not creators
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            New courses are being added. Check back soon!
          </p>
          <Link href="/courses" className="inline-block mt-4">
            <Button>View All Courses</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Course Catalog
        </h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Courses organized by outcomes, not creators
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categoriesWithCourses.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const categoryHref = `/courses/category/${category.slug}`;

          return (
            <Card key={category.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: category.color 
                        ? `${category.color}20` 
                        : 'hsl(var(--primary) / 0.1)',
                    }}
                  >
                    <Icon 
                      className="h-5 w-5" 
                      style={{
                        color: category.color || 'hsl(var(--primary))',
                      }}
                    />
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                {category.courses.length > 0 ? (
                  <div className="grid gap-2">
                    {category.courses.slice(0, 3).map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        className="group flex items-start justify-between gap-2 text-sm hover:text-primary transition-colors"
                      >
                        <span className="flex-1 line-clamp-1">{course.title}</span>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          ${(course.priceCents / 100).toFixed(0)}
                        </Badge>
                      </Link>
                    ))}
                    {category.courseCount > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{category.courseCount - 3} more {category.courseCount - 3 === 1 ? 'course' : 'courses'}
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
                      Instant access after purchase
                    </span>
                  </div>
                  <Link href={category.courses.length > 0 ? categoryHref : "/courses"}>
                    <Button variant="outline" className="w-full" size="sm">
                      {category.courses.length > 0 
                        ? `View ${category.name} Courses` 
                        : 'Browse All Courses'
                      } →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* View All Courses Link */}
      <div className="text-center">
        <Link href="/courses">
          <Button size="lg" variant="outline">
            View All {stats.totalCourses} Courses
          </Button>
        </Link>
      </div>
    </section>
  );
}
