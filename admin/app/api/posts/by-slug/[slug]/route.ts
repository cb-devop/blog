import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET post by slug (public — returns minimal data for comment system)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error finding post by slug:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
