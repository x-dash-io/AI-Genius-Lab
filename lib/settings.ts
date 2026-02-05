import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type SocialLinks = {
    facebook: string;
    linkedin: string;
    twitter: string;
    tiktok: string;
};

export type HeroLogo = {
    id: string;
    name: string;
    type: "image" | "icon";
    value: string; // URL for image, Icon Name for icon
    visible: boolean;
};

export const defaultSocialLinks: SocialLinks = {
    facebook: "#",
    linkedin: "#",
    twitter: "#",
    tiktok: "#",
};

export const defaultHeroLogos: HeroLogo[] = [
    { id: "openai", name: "OpenAI", type: "image", value: "/logos/openai.svg", visible: true },
    { id: "microsoft", name: "Microsoft", type: "image", value: "/logos/microsoft.svg", visible: true },
    { id: "meta", name: "Meta", type: "image", value: "/logos/meta.svg", visible: true },
    { id: "midjourney", name: "Midjourney", type: "image", value: "/logos/midjourney.svg", visible: true },
    { id: "vercel", name: "Vercel", type: "image", value: "/logos/vercel.svg", visible: true },
];

export async function getSiteSettings<T>(key: string, defaultValue: T): Promise<T> {
    const setting = await prisma.siteSettings.findUnique({
        where: { key },
    });

    if (!setting) return defaultValue;
    return setting.value as T;
}

export const getSocialLinks = unstable_cache(
    async () => getSiteSettings<SocialLinks>("social_links", defaultSocialLinks),
    ["site_settings", "social_links"],
    { tags: ["site_settings"] }
);

export const getHeroLogos = unstable_cache(
    async () => getSiteSettings<HeroLogo[]>("hero_logos", defaultHeroLogos),
    ["site_settings", "hero_logos"],
    { tags: ["site_settings"] }
);
