"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { canOptimizeImageUrl, normalizeImageUrl, passthroughImageLoader } from "@/lib/images";

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
    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, index) => {
        const courseImage = normalizeImageUrl(course.imageUrl);
        const usePassthroughLoader = courseImage ? !canOptimizeImageUrl(courseImage) : false;

        return (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ y: -6 }}
          >
            <Card className="h-full flex flex-col overflow-hidden group border-white/10 shadow-xl shadow-black/5 hover:shadow-primary/5 transition-all duration-500 rounded-2xl">
              {/* Course Image Area */}
              <div className="relative aspect-[16/10] overflow-hidden bg-accent/20">
                {courseImage ? (
                  <Image
                    src={courseImage}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                    loader={usePassthroughLoader ? passthroughImageLoader : undefined}
                    unoptimized={usePassthroughLoader}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-premium-gradient opacity-10" />
                )}

                {/* Overlay Gradient for dynamic feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {course.tier === "PREMIUM" && (
                  <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform duration-300">
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px] font-black tracking-widest px-2.5 py-1 border-none shadow-lg shadow-amber-500/20">
                      PREMIUM
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="space-y-4 p-6 flex-1">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Career Track</p>
                  <CardTitle className="line-clamp-2 text-2xl font-extrabold tracking-tight group-hover:text-primary transition-colors duration-300">
                    {course.title}
                  </CardTitle>
                </div>
                <CardDescription className="line-clamp-2 text-sm leading-relaxed font-medium text-muted-foreground/80">
                  {course.description ?? "Embark on a professional journey with our structured AI curriculum designed for real-world impact."}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-6">
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/40">Investment</p>
                    <p className="text-2xl font-black text-foreground">
                      ${(course.priceCents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <AddToCartButton
                    courseId={course.id}
                    courseSlug={course.slug}
                    priceCents={course.priceCents}
                    tier={course.tier}
                    variant="premium"
                    className="flex-[2] rounded-xl h-11"
                    checkOwnership
                  />
                  <Link href={`/courses/${course.slug}`} className="flex-1">
                    <Button variant="outline" className="w-full rounded-xl h-11 font-bold">
                      Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

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
