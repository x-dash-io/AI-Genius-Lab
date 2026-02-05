import { getSocialLinks, getHeroLogos } from "@/lib/settings";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const [socialLinks, heroLogos] = await Promise.all([
        getSocialLinks(),
        getHeroLogos(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Site Settings</h2>
                <p className="text-muted-foreground">
                    Manage global site settings, including social links and hero section logos.
                </p>
            </div>

            <SiteSettingsForm
                initialSocialLinks={socialLinks}
                initialHeroLogos={heroLogos}
            />
        </div>
    );
}
