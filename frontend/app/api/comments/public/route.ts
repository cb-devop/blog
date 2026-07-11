import { NextResponse } from "next/server";

const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://localhost:3001";

// Helper: resolve slug to real post ID from admin API
async function resolvePostId(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/posts/by-slug/${slug}`);
    if (res.ok) {
      const data = await res.json();
      return data.id || null;
    }
  } catch {}
  return null;
}

// GET approved comments for a post (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const postId = await resolvePostId(slug);
    if (!postId) {
      return NextResponse.json({ comments: [] });
    }

    const res = await fetch(`${ADMIN_API_URL}/api/posts/${postId}/comments`);

    if (!res.ok) {
      return NextResponse.json({ comments: [] });
    }

    const data = await res.json();
    const approved = (data.comments || []).filter((c: any) => c.isApproved)
      .map((c: any) => ({
        id: c.id,
        authorName: c.authorName,
        content: c.content,
        createdAt: c.createdAt,
      }));

    return NextResponse.json({ comments: approved });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ comments: [] });
  }
}

// POST new comment (public) — accepts slug, resolves to real post ID
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: Request) {
  try {
    const { slug, authorName, authorEmail, content } = await request.json();

    if (!slug || !authorName || !authorEmail || !content) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const postId = await resolvePostId(slug);
    if (!postId) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Forward to admin API with the real post ID
    const res = await fetch(`${ADMIN_API_URL}/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorName, authorEmail, content }),
    });

    const data = await res.json();

    if (res.ok) {
      return NextResponse.json(data, { status: 201 });
    }

    return NextResponse.json(
      { error: data.error || "Failed to submit comment" },
      { status: res.status }
    );
  } catch (error) {
    console.error("Error submitting comment:", error);
    return NextResponse.json(
      { error: "Failed to submit comment. Please try again." },
      { status: 500 }
    );
  }
}
