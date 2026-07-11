import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, apiError, logAudit, validateString, validateHtmlContent } from "@/lib/security";
import { resolveTagIds } from "@/lib/tags";

// GET single post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, email: true } },
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    const data = await request.json();

    // Resolve tag names to database IDs (TagInput returns names, not IDs)
    const tags = data.tags?.length ? await resolveTagIds(data.tags) : [];
    const categories = data.categories?.length
      ? data.categories.map((id: string) => ({ id }))
      : [];

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: validateString(data.title, 200),
        slug: validateString(data.slug, 200) || undefined,
        content: validateHtmlContent(data.content, 100000),
        excerpt: validateString(data.excerpt, 500),
        featuredImg: data.featuredImage || data.featuredImg || "",
        status: ["DRAFT", "PUBLISHED", "SCHEDULED"].includes(data.status) ? data.status : undefined,
        seoTitle: validateString(data.seo?.metaTitle || data.seoTitle, 70),
        seoDesc: validateString(data.seo?.metaDescription || data.seoDesc, 160),
        seoKeywords: validateString(data.seo?.metaKeywords || data.seoKeywords, 300),
        ogImage: data.seo?.ogImage || data.ogImage || "",
        categories: { set: categories },
        tags: { set: tags },
      },
    });

    logAudit("post.update", auth.userId, `Updated post: ${id}`, request);
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    return apiError("Internal server error", 500);
  }
}

// DELETE post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only ADMIN can delete posts
    const auth = requireAdmin(request);
    if (!auth) return apiError("Forbidden: Admin access required", 403);

    const { id } = await params;
    await prisma.post.delete({ where: { id } });

    logAudit("post.delete", auth.userId, `Deleted post: ${id}`, request);
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return apiError("Internal server error", 500);
  }
}