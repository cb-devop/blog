import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, apiError, logAudit, validateString, validateSlug } from "@/lib/security";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { name, slug } = await request.json();
    const cleanName = validateString(name, 50);
    const cleanSlug = validateString(slug, 100);

    if (!cleanName || !cleanSlug || !validateSlug(cleanSlug)) {
      return apiError("Valid name and slug are required", 400);
    }

    const existing = await prisma.tag.findUnique({ where: { slug: cleanSlug } });
    if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

    const tag = await prisma.tag.create({ data: { name: cleanName, slug: cleanSlug } });
    logAudit("tag.create", auth.userId, `Created tag: ${cleanSlug}`, request);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { id, name, slug } = await request.json();
    if (!id) return apiError("Tag ID is required", 400);

    const cleanName = validateString(name, 50);
    const cleanSlug = validateString(slug, 100);
    if (!cleanName || !cleanSlug || !validateSlug(cleanSlug)) {
      return apiError("Valid name and slug are required", 400);
    }

    const tag = await prisma.tag.update({ where: { id }, data: { name: cleanName, slug: cleanSlug } });
    logAudit("tag.update", auth.userId, `Updated tag: ${id}`, request);
    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error updating tag:", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth) return apiError("Forbidden: Admin access required", 403);

    const { id } = await request.json();
    if (!id) return apiError("Tag ID is required", 400);

    await prisma.tag.delete({ where: { id } });
    logAudit("tag.delete", auth.userId, `Deleted tag: ${id}`, request);
    return NextResponse.json({ message: "Tag deleted" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return apiError("Internal server error", 500);
  }
}
