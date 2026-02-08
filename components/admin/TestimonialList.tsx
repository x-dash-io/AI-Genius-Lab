"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Star,
    MoreVertical,
    Edit,
    Trash2,
    StarOff,
    Plus,
    Quote
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTestimonialActions } from "@/hooks/use-testimonial-actions";
import { TestimonialForm } from "./TestimonialForm";
import { Testimonial } from "@/lib/testimonials";

interface TestimonialListProps {
    initialTestimonials: Testimonial[];
}

export function TestimonialList({ initialTestimonials }: TestimonialListProps) {
    const { handleDelete, handleToggleFeatured, isPending } = useTestimonialActions();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

    const onEdit = (testimonial: Testimonial) => {
        setEditingTestimonial(testimonial);
        setIsFormOpen(true);
    };

    const onAdd = () => {
        setEditingTestimonial(null);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={onAdd} className="gap-2 rounded-xl">
                    <Plus className="h-4 w-4" />
                    Add Testimonial
                </Button>
            </div>

            <div className="grid gap-4">
                {initialTestimonials.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No testimonials found. Click the button above to add one.
                        </CardContent>
                    </Card>
                ) : (
                    initialTestimonials.map((testimonial) => (
                        <Card key={testimonial.id} className="overflow-hidden group transition-all hover:shadow-md">
                            <CardHeader className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-primary/10">
                                            <AvatarImage src={testimonial.avatar || undefined} alt={testimonial.name} />
                                            <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                                                {testimonial.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg leading-none">{testimonial.name}</h3>
                                                {testimonial.featured && (
                                                    <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 border-none text-[10px] h-5">
                                                        Featured
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium">{testimonial.role}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                        <div className="flex items-center bg-primary/5 px-2 py-1 rounded-lg">
                                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1.5" />
                                            <span className="text-sm font-bold text-primary">{testimonial.rating}</span>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" disabled={isPending}>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl">
                                                <DropdownMenuItem onClick={() => onEdit(testimonial)} className="rounded-lg">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleFeatured(testimonial.id, !testimonial.featured)}
                                                    className="rounded-lg"
                                                >
                                                    {testimonial.featured ? (
                                                        <>
                                                            <StarOff className="mr-2 h-4 w-4" />
                                                            Remove from Home
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Star className="mr-2 h-4 w-4" />
                                                            Feature on Home
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive rounded-lg"
                                                    onClick={() => {
                                                        if (confirm("Permanently delete this success story?")) {
                                                            handleDelete(testimonial.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete RECORD
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                                <div className="relative">
                                    <Quote className="absolute -top-1 -left-1 h-8 w-8 text-primary/5 -z-10" />
                                    <p className="text-muted-foreground text-sm italic leading-relaxed pl-4 border-l-2 border-primary/20">
                                        &quot;{testimonial.text}&quot;
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <Badge variant="secondary" className="bg-secondary/50 text-[10px] font-bold tracking-wider uppercase">
                                        {testimonial.category}
                                    </Badge>
                                    {testimonial.courseOrPath && (
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                                            Ref: {testimonial.courseOrPath}
                                        </span>
                                    )}
                                    <span className="text-xs text-muted-foreground ml-auto">
                                        Recorded {format(new Date(testimonial.date), "MMM d, yyyy")}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <TestimonialForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                testimonial={editingTestimonial}
            />
        </div>
    );
}
