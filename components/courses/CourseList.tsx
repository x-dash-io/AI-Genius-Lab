"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

type Course = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  priceCents: number;
  tier: "STANDARD" | "PREMIUM";
  imageUrl: string | null;
};

type CourseListProps = {
  courses: Course[];
};

export function CourseList({ courses }: CourseListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ y: -4 }}
        >
          <Card className="h-full transition-shadow hover:shadow-lg flex flex-col overflow-hidden group">
            {/* Course Image/Placeholder */}
            <div className="relative aspect-video overflow-hidden border-b bg-muted">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6">
                  <div className="text-center space-y-2">
                    <span className="text-4xl font-bold opacity-20 select-none">AI</span>
                    <p className="text-xs font-medium text-primary/40 uppercase tracking-widest">Premium Content</p>
                  </div>
                </div>
              )}
              {course.tier === "PREMIUM" && (
                <div className="absolute top-3 right-3">
                  <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white font-bold border-none shadow-sm">
                    PREMIUM
                  </Badge>
                </div>
              )}
            </div>

            <CardHeader className="space-y-3 p-6 pb-2">
              <CardTitle className="line-clamp-2 text-xl leading-tight group-hover:text-primary transition-colors">
                {course.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                {course.description ?? "Course details coming soon."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 flex-1 flex flex-col justify-end space-y-4">
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Lifetime Access</p>
                  <p className="text-xl font-bold text-foreground">
                    ${(course.priceCents / 100).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <AddToCartButton
                  courseId={course.id}
                  courseSlug={course.slug}
                  priceCents={course.priceCents}
                  tier={course.tier}
                  variant="default"
                  className="flex-1 shadow-md hover:shadow-lg transition-all"
                  checkOwnership
                />
                <Link href={`/courses/${course.slug}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      {courses.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No courses available at the moment. Check back soon for new courses!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
