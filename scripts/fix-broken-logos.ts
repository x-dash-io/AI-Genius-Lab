
import { prisma } from "@/lib/prisma";
import { defaultHeroLogos } from "@/lib/settings";
import type { Prisma } from "@prisma/client";

async function main() {
    console.log("Fixing broken logos in database...");

    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: "hero_logos" },
        });

        if (!setting) {
            console.log("No hero_logos setting found. Creating default...");
            await prisma.siteSettings.create({
                data: {
                    key: "hero_logos",
                    value: defaultHeroLogos as Prisma.JsonValue,
                },
            });
            console.log("Created default hero_logos.");
        } else {
            console.log("Updating existing hero_logos...");
            await prisma.siteSettings.update({
                where: { key: "hero_logos" },
                data: {
                    value: defaultHeroLogos as Prisma.JsonValue,
                },
            });
            console.log("Updated hero_logos to defaults.");
        }

        console.log("Done!");
    } catch (error) {
        console.error("Error fixing logos:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
