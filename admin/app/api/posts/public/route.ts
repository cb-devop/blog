import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPreviewToken } from "@/lib/preview";

// GET published posts (public — no auth required)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const slug = searchParams.get("slug");

    // If slug provided, return single post
    if (slug) {
      const post = await prisma.post.findUnique({
        where: { slug },
        include: {
          author: { select: { name: true, email: true } },
          categories: true,
          tags: true,
        },
      });

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      // Drafts/scheduled posts are only served when a valid preview token is provided
      if (post.status !== "PUBLISHED" && !verifyPreviewToken(post.slug, searchParams.get("preview"))) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      return NextResponse.json({ post });
    }

    // Otherwise return paginated published posts
    const where = { status: "PUBLISHED" };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { name: true, email: true } },
          categories: true,
          tags: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching public posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
