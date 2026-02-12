"use client";

import { CourseList } from "@/components/courses/CourseList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ComponentProps } from "react";

interface HomeFeaturedCoursesProps {
    courses: ComponentProps<typeof CourseList>["courses"];
}

export function HomeFeaturedCourses({ courses }: HomeFeaturedCoursesProps) {
    if (courses.length === 0) return null;

    return (
        <section className="relative py-12 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                        <Sparkles className="h-3 w-3" />
                        Curated Learning
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                        Featured AI Courses
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl sm:max-w-3xl">
                        Dive into our most popular courses and start your journey towards AI mastery today.
                    </p>
                </div>
                <Link href="/courses">
                    <Button variant="ghost" className="group text-primary hover:text-primary hover:bg-primary/5 font-semibold">
                        View All Courses
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </div>

            <CourseList courses={courses.slice(0, 6)} />
        </section>
    );
}
