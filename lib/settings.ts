import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type SocialLinks = {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
    github: string;
};

export const defaultSocialLinks: SocialLinks = {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
    tiktok: "#",
    github: "#",
};

export type HeroLogo = {
    id: string;
    name: string;
    type: "image" | "icon";
    value: string; // URL for image, Icon Name for icon
    visible: boolean;
};

export const defaultHeroLogos: HeroLogo[] = [
    { id: "openai", name: "OpenAI", type: "image", value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/openai/openai-original.svg", visible: true },
    { id: "microsoft", name: "Microsoft", type: "image", value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg", visible: true },
    { id: "meta", name: "Meta", type: "image", value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg", visible: true },
    { id: "midjourney", name: "Midjourney", type: "icon", value: "Sparkles", visible: true },
    { id: "google", name: "Google", type: "image", value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg", visible: true },
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
    async () => {
        const logos = await getSiteSettings<any[]>("hero_logos", defaultHeroLogos);
        return logos.map(logo => ({
            ...logo,
            id: logo.id || `logo-${Math.random()}`,
            type: logo.type || "image",
            value: logo.value || logo.url || "",
            visible: logo.visible === true || logo.visible === "true" || logo.visible === undefined,
        })) as HeroLogo[];
    },
    ["site_settings", "hero_logos"],
    { tags: ["site_settings"] }
);
