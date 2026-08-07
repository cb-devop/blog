import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, logAudit, validateString, validateHtmlContent } from "@/lib/security";
import { generatePreviewToken } from "@/lib/preview";
import { resolveTagIds } from "@/lib/tags";

// GET all posts
export async function GET(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: { select: { name: true, email: true } },
        categories: true,
        tags: true,
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.post.count({ where });

    // For non-published posts, attach a signed preview URL so admins can
    // preview drafts/scheduled posts on the frontend without publishing.
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const postsWithPreview = posts.map((post) => {
      if (post.status === "PUBLISHED") return post;
      return {
        ...post,
        previewUrl: `${frontendUrl}/blog/${post.slug}?preview=${generatePreviewToken(post.slug)}`,
      };
    });

    return NextResponse.json({
      posts: postsWithPreview,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new post
export async function POST(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const data = await request.json();

    // Sanitize inputs
    const title = validateString(data.title, 200);
    if (!title) return apiError("Title is required", 400);

    let slug = validateString(data.slug, 200);
    if (!slug) {
      // Auto-generate slug from title if not provided
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 200);
      if (!slug) return apiError("Could not generate slug from title", 400);
    }

    // Check for duplicate slug
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content: validateHtmlContent(data.content, 100000),
        excerpt: validateString(data.excerpt, 500),
        featuredImg: data.featuredImage || data.featuredImg || undefined,
        status: ["DRAFT", "PUBLISHED", "SCHEDULED"].includes(data.status) ? data.status : "DRAFT",
        seoTitle: validateString(data.seo?.metaTitle || data.seoTitle, 70),
        seoDesc: validateString(data.seo?.metaDescription || data.seoDesc, 160),
        seoKeywords: validateString(data.seo?.metaKeywords || data.seoKeywords, 300),
        ogImage: data.seo?.ogImage || data.ogImage || "",
        authorId: auth.userId,
        categories: data.categories?.length
          ? { connect: data.categories.map((id: string) => ({ id })) }
          : {},
        tags: data.tags?.length
          ? { connect: await resolveTagIds(data.tags) }
          : {},
      },
    });

    logAudit("post.create", auth.userId, `Created post: ${slug}`, request);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return apiError("Internal server error", 500);
  }
}