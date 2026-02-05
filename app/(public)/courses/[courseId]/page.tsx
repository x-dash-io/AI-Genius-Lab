import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCoursePreviewBySlug } from "@/lib/courses";
import { getCourseReviewStats } from "@/lib/reviews";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { CourseActions } from "@/components/courses/CourseActions";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { generateCourseSchema } from "@/lib/seo/schemas";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export const dynamic = "force-dynamic";

type CourseDetailPageProps = {
  params: Promise<{ courseId: string }>;
};

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCoursePreviewBySlug(courseId);

  if (!course) {
    return generateSEOMetadata({
      title: "Course Not Found",
      noindex: true,
    });
  }

  return generateSEOMetadata({
    title: course.title,
    description: course.description || `Learn ${course.title} with structured lessons and progress tracking.`,
    keywords: ["AI course", course.title, "online learning"],
    url: `/courses/${course.slug}`,
    type: "website",
    image: `/api/og?title=${encodeURIComponent(course.title)}&description=${encodeURIComponent(course.description || `Learn ${course.title} with structured lessons and progress tracking.`)}`,
  });
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { courseId } = await params;
  const course = await getCoursePreviewBySlug(courseId);

  if (!course) {
    notFound();
  }

  const reviewStats = await getCourseReviewStats(course.id);
  const lessons = course.sections.flatMap((section: any) =>
    section.lessons.map((lesson: any) => ({
      ...lesson,
      contents: lesson.contents,
    }))
  );

  const courseSchema = generateCourseSchema({
    name: course.title,
    description: course.description || `Learn ${course.title}`,
    url: `/courses/${course.slug}`,
    priceCents: course.priceCents,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(courseSchema),
        }}
      />
      <div className="min-h-screen pb-20">
        <section className="container mx-auto px-4 pt-12 space-y-12">
          {/* Enhanced Navigation */}
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Courses", url: "/courses" },
              { name: course.title },
            ]}
          />

          {/* Premium Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold tracking-widest text-[10px] uppercase">
                    Professional Suite
                  </Badge>
                  {course.tier === "PREMIUM" && (
                    <Badge className="bg-amber-500 text-white border-none px-3 py-1 font-black tracking-widest text-[10px] uppercase shadow-lg shadow-amber-500/20">
                      PREMIUM
                    </Badge>
                  )}
                </div>
                <h1 className="font-display text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
                  {course.title}
                </h1>
                <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed max-w-xl">
                  {course.description ?? "Elevate your professional toolkit with our practitioner-led AI curriculum."}
                </p>

                <div className="flex items-center gap-6 pt-4 text-sm font-bold text-muted-foreground/60">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Lifetime Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Project Based</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Certificate Included</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <CourseActions
                  courseId={course.id}
                  courseSlug={course.slug}
                  priceCents={course.priceCents}
                  tier={course.tier}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="relative aspect-[4/3] w-full"
            >
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-[3rem] opacity-50" />

              <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border-4 border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] bg-muted group">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-premium-gradient opacity-20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

                {/* Stats Overlay */}
                <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-4">
                  {[
                    { label: "Students", value: "2.4k+" },
                    { label: "Rating", value: "4.9/5" },
                    { label: "Duration", value: "12h" },
                  ].map((stat, i) => (
                    <div key={i} className="glass p-4 rounded-2xl border-white/10 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</p>
                      <p className="text-lg font-black text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Curriculum Section */}
          <div className="grid lg:grid-cols-3 gap-12 pt-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Curriculum Preview</h2>
                <p className="text-muted-foreground font-medium">Explore the structured learning path designed for this module.</p>
              </div>

              <div className="grid gap-4">
                {lessons.length === 0 ? (
                  <Card glass className="py-12 border-dashed border-2">
                    <CardContent className="text-center">
                      <p className="font-bold text-muted-foreground">Curriculum structure is being finalized.</p>
                    </CardContent>
                  </Card>
                ) : (
                  lessons.slice(0, 8).map((lesson: any, i: number) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group flex items-center justify-between rounded-2xl glass border-white/5 p-5 hover:bg-accent/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center font-black text-xs text-primary/60 border border-white/10 group-hover:scale-110 transition-transform">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{lesson.title}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">
                            {lesson.contents?.[0]?.contentType || "Unit"} • Professional Access
                          </p>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-8">
              {/* Reviews Section */}
              <div className="glass rounded-[2rem] p-8 border-white/10 shadow-2xl">
                <ReviewSection courseId={course.id} initialStats={reviewStats} />
              </div>
            </div>
          </div>
        </section>
      </div>

    </>
  );
}
