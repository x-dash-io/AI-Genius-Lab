"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Route, BookOpen, Star, Quote } from "lucide-react";
import { Testimonial, TestimonialCategory } from "@/lib/testimonials";

interface TestimonialsClientProps {
    initialTestimonials: Testimonial[];
}

const categories = [
    { id: "all" as TestimonialCategory, label: "All", icon: GraduationCap },
    { id: "courses" as TestimonialCategory, label: "Courses", icon: BookOpen },
    { id: "learning-paths" as TestimonialCategory, label: "Learning Paths", icon: Route },
    { id: "platform" as TestimonialCategory, label: "Platform", icon: Star },
];

export function TestimonialsClient({ initialTestimonials }: TestimonialsClientProps) {
    const [activeCategory, setActiveCategory] = useState<TestimonialCategory>("all");

    const filteredTestimonials = activeCategory === "all"
        ? initialTestimonials
        : initialTestimonials.filter(t => t.category === activeCategory);

    return (
        <div className="space-y-12">
            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-10 justify-center"
            >
                {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;

                    return (
                        <Button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            variant={isActive ? "default" : "outline"}
                            className={`gap-2 transition-all ${isActive ? 'scale-105' : 'hover:scale-105'}`}
                        >
                            <Icon className="h-4 w-4" />
                            {category.label}
                        </Button>
                    );
                })}
            </motion.div>

            {/* Testimonials Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                >
                    {filteredTestimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative overflow-hidden rounded-xl bg-card border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="absolute top-4 right-4 text-primary/10 group-hover:text-primary/20 transition-colors">
                                <Quote className="h-12 w-12" fill="currentColor" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-start gap-3 mb-4">
                                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                                        <AvatarImage src={testimonial.avatar || undefined} alt={testimonial.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{testimonial.name}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{testimonial.role}</p>
                                    </div>
                                </div>

                                <div className="flex gap-1 mb-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < testimonial.rating
                                                ? 'text-amber-500 fill-amber-500'
                                                : 'text-muted-foreground/30'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                    &quot;{testimonial.text}&quot;
                                </p>

                                {testimonial.courseOrPath && (
                                    <Badge variant="secondary" className="text-xs">
                                        {testimonial.courseOrPath}
                                    </Badge>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
