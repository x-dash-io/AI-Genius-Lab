import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type SocialLink = {
    id: string;
    platform: string;
    url: string;
    visible: boolean;
};

export const defaultSocialLinks: SocialLink[] = [
    { id: "facebook", platform: "facebook", url: "#", visible: true },
    { id: "twitter", platform: "twitter", url: "#", visible: true },
    { id: "instagram", platform: "instagram", url: "#", visible: true },
    { id: "linkedin", platform: "linkedin", url: "#", visible: true },
    { id: "youtube", platform: "youtube", url: "#", visible: true },
];

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
    async () => {
        const links = await getSiteSettings<any>("social_links", defaultSocialLinks);

        // Migration logic: if it's the old object format
        if (links && !Array.isArray(links) && typeof links === 'object') {
            return Object.entries(links).map(([platform, url]) => ({
                id: platform,
                platform,
                url: url as string,
                visible: !!url && url !== "#",
            })) as SocialLink[];
        }

        // If it's already an array, ensure it matches SocialLink structure
        if (Array.isArray(links)) {
            return links.map(link => ({
                id: link.id || link.platform || `social-${Math.random()}`,
                platform: link.platform || "web",
                url: link.url || "#",
                visible: link.visible !== undefined ? link.visible : true,
            })) as SocialLink[];
        }

        return defaultSocialLinks;
    },
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
