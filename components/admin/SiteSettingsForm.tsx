"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toastSuccess, toastError } from "@/lib/toast";
import { Loader2, Plus, Trash2, GripVertical, Info } from "lucide-react";
import { updateSiteSettings } from "@/lib/actions/settings";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ContentUpload } from "@/components/admin/ContentUpload";

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

    // Migration helper: if initialHeroLogos come from old structure (without type), default them
    const migratedHeroLogos: SettingsFormValues['heroLogos'] = (initialHeroLogos || []).map((logo: any) => ({
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

    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: "heroLogos",
    });

    function onSubmit(data: SettingsFormValues) {
        startTransition(async () => {
            try {
                await Promise.all([
                    updateSiteSettings("social_links", data.socialLinks),
                    updateSiteSettings("hero_logos", data.heroLogos)
                ]);
                toastSuccess("Settings saved", "Your changes have been updated.");
            } catch (error: any) {
                toastError("Something went wrong", error.message);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Social Media Links */}
                <Card>
                    <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                        <CardDescription>
                            Manage social media links displayed in the footer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
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
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Hero Section Logos</CardTitle>
                                <CardDescription>
                                    Manage the trusted company logos displayed in the hero section.
                                </CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ id: `logo-${Date.now()}`, name: "", type: "image", value: "", visible: true })}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Logo
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-start gap-4 p-4 border rounded-md">
                                <div className="cursor-move mt-3 text-muted-foreground">
                                    <GripVertical className="h-5 w-5" />
                                </div>
                                <div className="grid gap-4 flex-1 md:grid-cols-12">
                                    {/* Name */}
                                    <FormField
                                        control={form.control}
                                        name={`heroLogos.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-3">
                                                <FormLabel className="text-xs">Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="OpenAI" {...field} />
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
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-xs">Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
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
                                            const type = form.watch(`heroLogos.${index}.type`);
                                            return (
                                                <FormItem className="md:col-span-5">
                                                    <div className="flex items-center gap-2">
                                                        <FormLabel className="text-xs">
                                                            {type === "image" ? "Image" : "Icon Name"}
                                                        </FormLabel>
                                                        {type === "icon" && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Enter exact Lucide icon name (e.g., Zap, Shield, Cloud).</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                    <FormControl>
                                                        {type === "image" ? (
                                                            <div className="border rounded-md p-2">
                                                                <ContentUpload
                                                                    sectionId="hero-logos"
                                                                    contentType="image"
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    returnUrl={true}
                                                                    onError={(err) => toastError("Image Error", err)}
                                                                />
                                                                <Input type="hidden" {...field} />
                                                            </div>
                                                        ) : (
                                                            <Input
                                                                placeholder="Zap"
                                                                {...field}
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
                                            <FormItem className="md:col-span-2 flex flex-col items-center justify-center pt-2">
                                                <FormLabel className="text-xs mb-2">Visible</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="mt-6 text-destructive" onClick={() => remove(index)}>
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

                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </Form>
    );
}
