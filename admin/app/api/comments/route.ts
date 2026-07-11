import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError } from "@/lib/security";

// GET all comments (admin) — with optional status filter
export async function GET(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "pending", "approved", or "all"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (status === "pending") where.isApproved = false;
    else if (status === "approved") where.isApproved = true;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: { post: { select: { id: true, title: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      comments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return apiError("Internal server error", 500);
  }
}
