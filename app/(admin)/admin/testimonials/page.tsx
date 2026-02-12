import { Suspense } from "react";
import { requireRole } from "@/lib/access";
import { getAllTestimonials } from "@/lib/admin/testimonials";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";
import { TestimonialList } from "@/components/admin/TestimonialList";
import type { Testimonial } from "@/lib/testimonials";

export const dynamic = "force-dynamic";

async function TestimonialsContent() {
    const testimonials = await getAllTestimonials();
    type TestimonialItem = (typeof testimonials)[number];

    return (
        <div className="space-y-8">
            {/* Stats Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Overview</CardTitle>
                    <CardDescription>
                        {testimonials.length} success stories total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Featured</p>
                            <p className="text-2xl font-bold">
                                {testimonials.filter((testimonial: TestimonialItem) => testimonial.featured).length}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Drafts</p>
                            <p className="text-2xl font-bold">
                                {testimonials.filter((testimonial: TestimonialItem) => !testimonial.featured).length}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Average Rating</p>
                            <p className="text-2xl font-bold">
                                {testimonials.length > 0
                                    ? (testimonials.reduce((sum, testimonial: TestimonialItem) => sum + testimonial.rating, 0) / testimonials.length).toFixed(1)
                                    : "0.0"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Testimonial List */}
            <TestimonialList initialTestimonials={testimonials as Testimonial[]} />
        </div>
    );
}

export default async function AdminTestimonialsPage() {
    await requireRole("admin");

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Management Section
                    </p>
                    <h1 className="mt-2 font-display text-4xl font-bold tracking-tight flex items-center gap-3">
                        <MessageSquare className="h-10 w-10 text-primary" />
                        Testimonials
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Manage student success stories and featured feedback.
                    </p>
                </div>
            </div>

            <Suspense fallback={
                <Card>
                    <CardContent className="py-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </CardContent>
                </Card>
            }>
                <TestimonialsContent />
            </Suspense>
        </div>
    );
}
