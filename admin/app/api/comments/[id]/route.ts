import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, logAudit } from "@/lib/security";

// PUT approve or reject a comment
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    const { isApproved } = await request.json();

    if (typeof isApproved !== "boolean") {
      return NextResponse.json({ error: "isApproved must be a boolean" }, { status: 400 });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { isApproved },
    });

    logAudit(
      isApproved ? "comment.approve" : "comment.reject",
      auth.userId,
      `${isApproved ? "Approved" : "Rejected"} comment ${id} on post ${comment.postId}`,
      request
    );

    return NextResponse.json({ message: isApproved ? "Comment approved" : "Comment rejected", comment });
  } catch (error) {
    console.error("Error updating comment:", error);
    return apiError("Internal server error", 500);
  }
}

// DELETE a comment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;

    await prisma.comment.delete({ where: { id } });

    logAudit("comment.delete", auth.userId, `Deleted comment ${id}`, request);

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return apiError("Internal server error", 500);
  }
}
