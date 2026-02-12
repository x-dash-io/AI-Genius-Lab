import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type SocialLink = {
    id: string;
    platform: string;
    url: string;
    visible: boolean;
};

export const defaultSocialLinks: SocialLink[] = [
    { id: "facebook", platform: "facebook", url: "", visible: false },
    { id: "twitter", platform: "twitter", url: "", visible: false },
    { id: "instagram", platform: "instagram", url: "", visible: false },
    { id: "linkedin", platform: "linkedin", url: "", visible: false },
    { id: "youtube", platform: "youtube", url: "", visible: false },
    { id: "tiktok", platform: "tiktok", url: "", visible: false },
    { id: "github", platform: "github", url: "", visible: false },
    { id: "discord", platform: "discord", url: "", visible: false },
    { id: "website", platform: "website", url: "", visible: false },
    { id: "other", platform: "other", url: "", visible: false },
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
        const links = await getSiteSettings<unknown>("social_links", defaultSocialLinks);

        // Migration logic: if it's the old object format
        if (links && !Array.isArray(links) && typeof links === "object") {
            return Object.entries(links).map(([platform, url]) => ({
                id: platform,
                platform,
                url: typeof url === "string" && url !== "#" ? url : "",
                visible: !!url && url !== "#",
            })) as SocialLink[];
        }

        // If it's already an array, ensure it matches SocialLink structure
        if (Array.isArray(links)) {
            return links.map((link, index) => {
                const socialLink = link as Partial<SocialLink>;
                const url = (socialLink.url || "").trim();
                const hasUrl = Boolean(url && url !== "#");
                return {
                    id: socialLink.id || socialLink.platform || `social-${index}`,
                    platform: socialLink.platform || "website",
                    url: hasUrl ? url : "",
                    visible:
                        socialLink.visible !== undefined
                            ? socialLink.visible && hasUrl
                            : hasUrl,
                };
            }) as SocialLink[];
        }

        return defaultSocialLinks;
    },
    ["site_settings", "social_links"],
    { tags: ["site_settings"] }
);

export const getHeroLogos = unstable_cache(
    async () => {
        const logos = await getSiteSettings<unknown[]>("hero_logos", defaultHeroLogos);
        return logos.map((logo) => {
            const logoRecord = logo as { visible?: unknown };
            const heroLogo = logo as Partial<HeroLogo> & { url?: string };
            const rawVisible = logoRecord.visible;
            return {
                ...heroLogo,
                id: heroLogo.id || `logo-${Math.random()}`,
                type: heroLogo.type || "image",
                value: heroLogo.value || heroLogo.url || "",
                visible: rawVisible === true || rawVisible === "true" || rawVisible === undefined,
            };
        }) as HeroLogo[];
    },
    ["site_settings", "hero_logos"],
    { tags: ["site_settings"] }
);
