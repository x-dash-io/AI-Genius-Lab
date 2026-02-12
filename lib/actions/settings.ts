
"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";

export async function updateSiteSettings(
    key: string,
    value: Prisma.InputJsonValue | null
) {
    const normalizedValue = value === null ? Prisma.JsonNull : value;

    const setting = await prisma.siteSettings.upsert({
        where: { key },
        update: { value: normalizedValue },
        create: { key, value: normalizedValue },
    });

    revalidateTag("site_settings");
    return setting;
}
