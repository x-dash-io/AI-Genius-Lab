
"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function updateSiteSettings(key: string, value: any) {
    const setting = await prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });

    revalidateTag("site_settings");
    return setting;
}
