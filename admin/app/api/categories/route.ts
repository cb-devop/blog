import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, apiError, logAudit, validateString, validateSlug } from "@/lib/security";

// GET all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { name, slug, description } = await request.json();
    const cleanName = validateString(name, 50);
    const cleanSlug = validateString(slug, 100);

    if (!cleanName || !cleanSlug || !validateSlug(cleanSlug)) {
      return apiError("Valid name and slug are required", 400);
    }

    const existing = await prisma.category.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: { name: cleanName, slug: cleanSlug, description: validateString(description, 200) },
    });

    logAudit("category.create", auth.userId, `Created: ${cleanSlug}`, request);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return apiError("Internal server error", 500);
  }
}

// PUT update category
export async function PUT(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { id, name, slug, description } = await request.json();
    if (!id) return apiError("Category ID is required", 400);

    const cleanName = validateString(name, 50);
    const cleanSlug = validateString(slug, 100);
    if (!cleanName || !cleanSlug || !validateSlug(cleanSlug)) {
      return apiError("Valid name and slug are required", 400);
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: cleanName, slug: cleanSlug, description: validateString(description, 200) },
    });

    logAudit("category.update", auth.userId, `Updated: ${id}`, request);
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return apiError("Internal server error", 500);
  }
}

// DELETE category
export async function DELETE(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth) return apiError("Forbidden: Admin access required", 403);

    const { id } = await request.json();
    if (!id) return apiError("Category ID is required", 400);

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });

    if (category && category._count.posts > 0) {
      return apiError("Cannot delete category with existing posts", 400);
    }

    await prisma.category.delete({ where: { id } });

    logAudit("category.delete", auth.userId, `Deleted category: ${id}`, request);
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return apiError("Internal server error", 500);
  }
}
