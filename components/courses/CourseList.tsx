"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Course = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
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
  );
}
