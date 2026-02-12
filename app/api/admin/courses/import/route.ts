import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/app/api/error-handler";
import { AppError } from "@/lib/errors";
import Papa from "papaparse";

type CourseImportRow = {
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  priceCents?: string;
  inventory?: string;
  isPublished?: string;
};

function parseOptionalInteger(value?: string): number | null {
  if (!value || value.trim() === "") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseIntegerWithDefault(value: string | undefined, fallback: number): number {
  const parsed = parseOptionalInteger(value);
  return parsed ?? fallback;
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireRole("admin");

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    throw AppError.badRequest("No file provided");
  }

  const text = await file.text();

  return new Promise<Response>((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const coursesData = results.data as CourseImportRow[];
          const createdCourses = [];
          const errors = [];

          for (const row of coursesData) {
            try {
              const { id, slug, title, description, category, priceCents, inventory, isPublished } = row;

              if (!id || !slug || !title) {
                errors.push({ row, error: "Missing required fields (id, slug, title)" });
                continue;
              }

              const course = await prisma.course.upsert({
                where: { id },
                update: {
                  slug,
                  title,
                  description: description || null,
                  category: category || null,
                  priceCents: parseIntegerWithDefault(priceCents, 0),
                  inventory: parseOptionalInteger(inventory),
                  isPublished: isPublished === "true" || isPublished === "1",
                  updatedAt: new Date(),
                },
                create: {
                  id,
                  slug,
                  title,
                  description: description || null,
                  category: category || null,
                  priceCents: parseIntegerWithDefault(priceCents, 0),
                  inventory: parseOptionalInteger(inventory),
                  isPublished: isPublished === "true" || isPublished === "1",
                  updatedAt: new Date(),
                },
              });
              createdCourses.push(course.id);
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : "Failed to import row";
              errors.push({ row, error: message });
            }
          }

          resolve(NextResponse.json({
            success: true,
            importedCount: createdCourses.length,
            errors,
          }));
        } catch (error) {
          reject(error);
        }
      },
      error: (error: { message?: string }) => {
        reject(AppError.badRequest(`CSV parsing error: ${error.message ?? "Unknown parser error"}`));
      }
    });
  });
});
