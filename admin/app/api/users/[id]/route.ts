import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, apiError, logAudit } from "@/lib/security";

// PUT: Update user role or other details (admin only)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAdmin(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;
    const { role } = await request.json();

    // Validate role
    const allowedRoles = ["ADMIN", "EDITOR", "BANNED"];
    if (!allowedRoles.includes(role)) {
      return apiError("Invalid role. Must be ADMIN, EDITOR, or BANNED", 400);
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return apiError("User not found", 404);
    }

    // Cannot change your own role (prevents self-demotion)
    if (id === auth.userId) {
      return apiError("You cannot change your own role", 400);
    }

    // Enforce only ONE admin rule
    if (role === "ADMIN") {
      // Demote existing admin(s) to EDITOR
      await prisma.user.updateMany({
        where: { role: "ADMIN" },
        data: { role: "EDITOR" },
      });
    }

    // Update the user's role
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    logAudit("user.update", auth.userId, `Updated user ${updated.email} role to ${role}`, request);
    return NextResponse.json({ message: "User updated successfully", user: updated });
  } catch (error) {
    console.error("Error updating user:", error);
    return apiError("Internal server error", 500);
  }
}

// DELETE: Remove a user (admin only)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAdmin(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { id } = await params;

    // Cannot delete yourself
    if (id === auth.userId) {
      return apiError("You cannot delete your own account", 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return apiError("User not found", 404);
    }

    // Delete the user (their posts will be orphaned - handle accordingly)
    await prisma.user.delete({ where: { id } });

    logAudit("user.delete", auth.userId, `Deleted user: ${user.email}`, request);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return apiError("Internal server error", 500);
  }
}
