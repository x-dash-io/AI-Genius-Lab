"use client";

import React from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toastSuccess, toastError } from "@/lib/toast";
import { Loader2, Plus, Trash2, GripVertical, Info, Save } from "lucide-react";
import { updateSiteSettings } from "@/lib/actions/settings";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LogoImageUpload } from "@/components/admin/LogoImageUpload";
import { useEffect } from "react";

const settingsSchema = z.object({
    socialLinks: z.object({
        facebook: z.string().url().optional().or(z.literal("")),
        twitter: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal("")),
        youtube: z.string().url().optional().or(z.literal("")),
        tiktok: z.string().url().optional().or(z.literal("")),
        github: z.string().url().optional().or(z.literal("")),
    }),
    heroLogos: z.array(
        z.object({
            id: z.string(),
            name: z.string().min(1, "Name is required"),
            type: z.enum(["image", "icon"]),
            value: z.string().min(1, "Value is required"),
            visible: z.boolean(),
        })
    ),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SiteSettingsFormProps {
    initialSocialLinks: SettingsFormValues['socialLinks'];
    initialHeroLogos: SettingsFormValues['heroLogos'];
}

export function SiteSettingsForm({ initialSocialLinks, initialHeroLogos }: SiteSettingsFormProps) {
    const [isPending, startTransition] = useTransition();
    const [lastSaved, setLastSaved] = React.useState<{ socialLinks: SettingsFormValues['socialLinks']; heroLogos: SettingsFormValues['heroLogos'] } | null>(null);

    // Migration helper: if initialHeroLogos come from old structure (without type), default them
    const migratedHeroLogos: SettingsFormValues['heroLogos'] = (initialHeroLogos || []).map((logo: { id: string; name?: string; type?: string; value?: string; url?: string; visible?: boolean }) => ({
        id: logo.id,
        name: logo.name || "",
        type: (logo.type === "icon" || logo.type === "image") ? logo.type : "image",
        value: logo.value || logo.url || "", // migrate old 'url' to 'value'
        visible: logo.visible !== undefined ? !!logo.visible : true,
    }));

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            socialLinks: initialSocialLinks || {},
            heroLogos: migratedHeroLogos,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "heroLogos",
    });

    // Auto-save functionality
    useEffect(() => {
        const subscription = form.watch((value) => {
            const timer = setTimeout(() => {
                if (JSON.stringify(value) !== JSON.stringify(lastSaved)) {
                    startTransition(async () => {
                        try {
                            await Promise.all([
                                updateSiteSettings("social_links", value.socialLinks),
                                updateSiteSettings("hero_logos", (value.heroLogos || []).filter(Boolean))
                            ]);
                            setLastSaved({
                                socialLinks: value.socialLinks || {},
                                heroLogos: (value.heroLogos || []).filter((logo): logo is NonNullable<typeof logo> => Boolean(logo)).map(logo => ({
                                    id: logo.id || `logo-${Date.now()}`,
                                    name: logo.name || "",
                                    type: logo.type || "image",
                                    value: logo.value || "",
                                    visible: logo.visible !== undefined ? logo.visible : true
                                }))
                            });
                        } catch (error: unknown) {
                            console.error("Auto-save failed:", error);
                        }
                    });
                }
            }, 2000); // Auto-save after 2 seconds of inactivity

            return () => clearTimeout(timer);
        });

        return () => subscription.unsubscribe();
    }, [lastSaved, form]);

    function onSubmit(data: SettingsFormValues) {
        startTransition(async () => {
            try {
                await Promise.all([
                    updateSiteSettings("social_links", data.socialLinks),
                    updateSiteSettings("hero_logos", data.heroLogos)
                ]);
                toastSuccess("Settings saved", "Your changes have been updated.");
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
                toastError("Something went wrong", errorMessage);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-full overflow-x-hidden">
                {/* Auto-save indicator */}
                <div className="flex items-center justify-end mb-4 w-full">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Save className="h-4 w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">Auto-saving enabled</span>
                    </div>
                </div>

                {/* Social Media Links */}
                <Card className="w-full">
                    <CardHeader className="px-4 sm:px-6">
                        <CardTitle className="text-lg sm:text-xl">Social Media Links</CardTitle>
                        <CardDescription className="text-sm">
                            Manage social media links displayed in the footer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 sm:px-6">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="socialLinks.facebook"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Facebook</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://facebook.com/..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="socialLinks.twitter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>X (Twitter)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://twitter.com/..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="socialLinks.linkedin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>LinkedIn</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://linkedin.com/..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="socialLinks.tiktok"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>TikTok</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://tiktok.com/..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Hero Logos */}
                <Card className="w-full">
                    <CardHeader className="px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg sm:text-xl">Hero Section Logos</CardTitle>
                                <CardDescription className="text-sm">
                                    Manage the trusted company logos displayed in the hero section.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ id: `logo-${Date.now()}`, name: "", type: "image", value: "", visible: true })}
                                className="w-full sm:w-auto whitespace-nowrap"
                            >
                                <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
                                Add Logo
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 sm:px-6">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-md w-full overflow-x-hidden">
                                <div className="cursor-move mt-2 sm:mt-3 text-muted-foreground order-first sm:order-none">
                                    <GripVertical className="h-5 w-5" />
                                </div>
                                <div className="grid gap-3 sm:gap-4 flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 w-full">
                                    {/* Name */}
                                    <FormField
                                        control={form.control}
                                        name={`heroLogos.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-3 lg:col-span-3">
                                                <FormLabel className="text-xs">Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="OpenAI" {...field} className="w-full" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Type Selector */}
                                    <FormField
                                        control={form.control}
                                        name={`heroLogos.${index}.type`}
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2 lg:col-span-2">
                                                <FormLabel className="text-xs">Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="image">Image URL</SelectItem>
                                                        <SelectItem value="icon">Lucide Icon</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Value Input (Conditional) */}
                                    <FormField
                                        control={form.control}
                                        name={`heroLogos.${index}.value`}
                                        render={({ field }) => {
                                            const logoType = form.getValues(`heroLogos.${index}.type`);
                                            return (
                                                <FormItem className="sm:col-span-2 lg:col-span-5">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                        <FormLabel className="text-xs">
                                                            {logoType === "image" ? "Image" : "Icon Name"}
                                                        </FormLabel>
                                                        {logoType === "icon" && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Info className="h-3 w-3 text-muted-foreground cursor-help flex-shrink-0" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p className="max-w-xs">Enter exact Lucide icon name (e.g., Zap, Shield, Cloud).</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                    <FormControl>
                                                        {logoType === "image" ? (
                                                            <LogoImageUpload
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                            />
                                                        ) : (
                                                            <Input
                                                                placeholder="Zap"
                                                                {...field}
                                                                className="w-full"
                                                            />
                                                        )}
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />

                                    {/* Visible Toggle */}
                                    <FormField
                                        control={form.control}
                                        name={`heroLogos.${index}.visible`}
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2 lg:col-span-2 flex flex-col items-center justify-center pt-2">
                                                <FormLabel className="text-xs mb-2">Visible</FormLabel>
                                                <FormControl>
                                                    <ToggleSwitch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="mt-2 sm:mt-6 text-destructive flex-shrink-0"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                No logos added yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Button type="submit" disabled={isPending} size="lg" className="w-full sm:w-auto">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </Form>
    );
}
