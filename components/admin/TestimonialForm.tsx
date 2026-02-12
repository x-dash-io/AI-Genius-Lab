"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    X,
    Loader2,
    Star,
    Upload,
    MessageSquare,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTestimonialActions } from "@/hooks/use-testimonial-actions";
import { Testimonial } from "@/lib/testimonials";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.string().min(2, "Role must be at least 2 characters"),
    avatar: z.string().url().optional().or(z.literal("")),
    rating: z.string().min(1, "Rating is required"),
    text: z.string().min(10, "Testimonial must be at least 10 characters"),
    category: z.string(),
    courseOrPath: z.string().optional(),
    featured: z.boolean(),
    date: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface TestimonialFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    testimonial: Testimonial | null;
}

export function TestimonialForm({ open, onOpenChange, testimonial }: TestimonialFormProps) {
    const { handleCreate, handleUpdate, isPending } = useTestimonialActions();
    const [activeTab, setActiveTab] = useState<"content" | "settings">("content");
    const handleOpenStateChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setActiveTab("content");
        }
        onOpenChange(nextOpen);
    };

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            role: "",
            avatar: "",
            rating: "5",
            text: "",
            category: "all",
            courseOrPath: "",
            featured: false,
            date: new Date().toISOString().split("T")[0],
        },
    });

    useEffect(() => {
        if (open) {
            if (testimonial) {
                reset({
                    name: testimonial.name,
                    role: testimonial.role,
                    avatar: testimonial.avatar || "",
                    rating: testimonial.rating.toString(),
                    text: testimonial.text,
                    category: testimonial.category,
                    courseOrPath: testimonial.courseOrPath || "",
                    featured: testimonial.featured,
                    date: new Date(testimonial.date).toISOString().split("T")[0],
                });
            } else {
                reset({
                    name: "",
                    role: "",
                    avatar: "",
                    rating: "5",
                    text: "",
                    category: "all",
                    courseOrPath: "",
                    featured: false,
                    date: new Date().toISOString().split("T")[0],
                });
            }
        }
    }, [testimonial, reset, open]);

    const onSubmit = async (values: FormValues) => {
        const data = {
            ...values,
            rating: parseInt(values.rating),
        };

        if (testimonial) {
            await handleUpdate(testimonial.id, data);
        } else {
            await handleCreate(data);
        }
        handleOpenStateChange(false);
    };

    const featured = useWatch({ control, name: "featured" }) ?? false;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => !isPending && handleOpenStateChange(false)}
            />

            {/* Modal content */}
            <div className="relative bg-card border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between bg-primary/5">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            {testimonial ? "Edit Student Success Story" : "Record New Success Story"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1 lowercase tracking-tight">
                            {testimonial ? "Refining an existing testimonial" : "Capturing fresh feedback from the genius lab"}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenStateChange(false)}
                        disabled={isPending}
                        className="rounded-full hover:bg-primary/10 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Tabs Navigation */}
                    <div className="px-6 py-2 border-b bg-muted/30 flex gap-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab("content")}
                            className={cn(
                                "px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all border-b-2",
                                activeTab === "content" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Feedback
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("settings")}
                            className={cn(
                                "px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all border-b-2",
                                activeTab === "settings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Visibility
                        </button>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                        {activeTab === "content" ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Student Name</Label>
                                        <Input id="name" {...register("name")} placeholder="John Genius" className="rounded-xl border-primary/20 focus:border-primary transition-all" />
                                        {errors.name && <p className="text-xs text-destructive font-semibold mt-1">{errors.name.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Student Role</Label>
                                        <Input id="role" {...register("role")} placeholder="Senior AI Engineer" className="rounded-xl border-primary/20 focus:border-primary transition-all" />
                                        {errors.role && <p className="text-xs text-destructive font-semibold mt-1">{errors.role.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="avatar" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Avatar URL (Optional)</Label>
                                    <div className="flex gap-2">
                                        <Input id="avatar" {...register("avatar")} placeholder="https://..." className="rounded-xl border-primary/20 flex-1" />
                                        <Button type="button" variant="outline" size="icon" className="rounded-xl flex-shrink-0">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Recommended: 256x256px transparent PNG</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Platform Rating</Label>
                                        <select
                                            {...register("rating")}
                                            className="w-full h-10 px-4 py-2 bg-background border border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-bold text-amber-600"
                                        >
                                            <option value="5">★★★★★ Excellent (5)</option>
                                            <option value="4">★★★★ Very Good (4)</option>
                                            <option value="3">★★★ Good (3)</option>
                                            <option value="2">★★ Fair (2)</option>
                                            <option value="1">★ Poor (1)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Reference Category</Label>
                                        <select
                                            {...register("category")}
                                            className="w-full h-10 px-4 py-2 bg-background border border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-widest font-bold text-muted-foreground"
                                        >
                                            <option value="all">General Feedback</option>
                                            <option value="courses">Course Achievement</option>
                                            <option value="learning-paths">Path Completion</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="text" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Success Story Content</Label>
                                    <textarea
                                        id="text"
                                        {...register("text")}
                                        placeholder="Describe their experience..."
                                        className="w-full min-h-[120px] p-4 bg-background border border-primary/20 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none italic"
                                    />
                                    {errors.text && <p className="text-xs text-destructive font-semibold mt-1">{errors.text.message}</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="courseOrPath" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Reference Label</Label>
                                        <Input id="courseOrPath" {...register("courseOrPath")} placeholder="Mastering LLM" className="rounded-xl" />
                                        <p className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">Shown as &quot;Ref: Master LLM&quot;</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Submission Date</Label>
                                        <Input id="date" type="date" {...register("date")} className="rounded-xl" />
                                    </div>
                                </div>

                                <div
                                    className={cn(
                                        "p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                                        featured
                                            ? "border-amber-500 bg-amber-500/5 ring-4 ring-amber-500/10"
                                            : "border-primary/10 bg-transparent opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                    )}
                                    onClick={() => setValue("featured", !featured)}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Star className={cn("h-5 w-5", featured ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
                                            <h4 className="font-bold text-lg">Featured Success Story</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            This testimonial will be displayed in the premium carousel section of the landing page.
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "h-6 w-11 rounded-full p-1 transition-colors relative",
                                        featured ? "bg-amber-500" : "bg-muted-foreground/20"
                                    )}>
                                        <div className={cn(
                                            "h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                                            featured ? "translate-x-5" : "translate-x-0"
                                        )} />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Testimonials marked as <span className="text-foreground font-bold underline">Featured</span> are prioritized in our marketing components. Ensure the content is polished and represents our brand values.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t bg-muted/30 flex gap-3">
                        <Button
                            type="submit"
                            className="flex-1 rounded-xl h-12 text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                testimonial ? "Update Story" : "Publish to Lab"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="px-8 rounded-xl h-12 text-sm font-bold uppercase tracking-widest"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Discard
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
