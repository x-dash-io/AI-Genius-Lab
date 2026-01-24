import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, createCategory } from "@/lib/admin/categories";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, icon, color, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const category = await createCategory({
      name,
      slug,
      description,
      icon,
      color,
      isActive,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);

    if (error instanceof Error) {
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      if (error.message === "SLUG_EXISTS") {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
