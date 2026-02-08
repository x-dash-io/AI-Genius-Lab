"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Testimonial } from "@/lib/testimonials";

interface HomeTestimonialsProps {
    testimonials: Testimonial[];
}

export function HomeTestimonials({ testimonials }: HomeTestimonialsProps) {
    // testimonials are already filtered for featured in page.tsx
    const featured = testimonials;

    return (
        <section className="py-24 bg-gradient-to-b from-transparent to-primary/5">
            <div className="container px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                            Student Success Stories
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Join thousands of learners who are transforming their careers with practical AI skills.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featured.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-card border rounded-2xl p-8 relative flex flex-col hover:shadow-lg transition-shadow"
                        >
                            <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/10" fill="currentColor" />

                            <div className="mb-6">
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    &quot;{testimonial.text}&quot;
                                </p>
                            </div>

                            <div className="mt-auto flex items-center gap-4">
                                <Avatar className="h-10 w-10 border border-primary/20">
                                    <AvatarImage src={testimonial.avatar || undefined} alt={testimonial.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
