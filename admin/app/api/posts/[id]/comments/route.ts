import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/security";

// IP-based rate limiting for public comment submissions
const commentAttempts = new Map<string, { count: number; time: number }>();
const COMMENT_MAX_ATTEMPTS = 3;
const COMMENT_WINDOW_MINUTES = 30;

// GET comments for a post — public returns only approved, admin returns all
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get("x-user-id");

    const where: any = { postId: id };
    // If not authenticated, only return approved comments
    if (!userId) {
      where.isApproved = true;
    }

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return apiError("Internal server error", 500);
  }
}

// POST create a comment on a post (public - requires no auth, rate limited)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const entry = commentAttempts.get(ip);
    if (entry && now - entry.time > COMMENT_WINDOW_MINUTES * 60 * 1000) {
      commentAttempts.delete(ip);
    }
    const canPost = entry ? entry.count < COMMENT_MAX_ATTEMPTS : true;
    if (!canPost) {
      return NextResponse.json({ error: "Too many comments. Please try again later." }, { status: 429 });
    }

    const { id } = await params;
    const { authorName, authorEmail, content } = await request.json();

    // Validate
    if (!authorName || !authorEmail || !content) {
      return NextResponse.json({ error: "Name, email, and comment are required" }, { status: 400 });
    }

    const cleanName = authorName.trim().replace(/<[^>]*>/g, "").substring(0, 100);
    const cleanEmail = authorEmail.toLowerCase().trim();
    const cleanContent = content.trim().replace(/<[^>]*>/g, "").substring(0, 2000);

    if (!cleanEmail.includes("@") || cleanEmail.length > 255) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!cleanName || !cleanContent) {
      return NextResponse.json({ error: "Name and comment cannot be empty" }, { status: 400 });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Track attempt
    const current = commentAttempts.get(ip) || { count: 0, time: Date.now() };
    commentAttempts.set(ip, { count: current.count + 1, time: Date.now() });

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        authorName: cleanName,
        authorEmail: cleanEmail,
        content: cleanContent,
        isApproved: false,
      },
    });

    return NextResponse.json({
      message: "Comment submitted for review. It will appear after admin approval.",
      comment,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return apiError("Internal server error", 500);
  }
}
