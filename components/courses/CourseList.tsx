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
          <Card className="h-full transition-shadow hover:shadow-lg flex flex-col">
            <CardHeader className="space-y-3">
              <CardTitle className="line-clamp-2 text-xl leading-tight">
                {course.title}
              </CardTitle>
              <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                {course.description ?? "Course details coming soon."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                  ${(course.priceCents / 100).toFixed(2)}
                </Badge>
              </div>
              <div className="flex gap-2">
                <AddToCartButton
                  courseId={course.id}
                  courseSlug={course.slug}
                  priceCents={course.priceCents}
                  variant="default"
                  className="flex-1"
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
