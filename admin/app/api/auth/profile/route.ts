import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAuth, apiError, logAudit, validateString, validateEmail } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    });

    if (!user) return apiError("User not found", 404);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { name, email, currentPassword, newPassword } = await request.json();

    if (!name && !email && !newPassword) {
      return apiError("No data to update", 400);
    }

    const updateData: any = {};
    if (name) updateData.name = validateString(name, 100);
    if (email) {
      if (!validateEmail(email)) return apiError("Invalid email format", 400);
      const cleanEmail = email.toLowerCase().trim();
      const existing = await prisma.user.findFirst({ where: { email: cleanEmail, NOT: { id: auth.userId } } });
      if (existing) return apiError("Email already in use", 409);
      updateData.email = cleanEmail;
    }

    if (newPassword) {
      if (!currentPassword) return apiError("Current password is required to set a new password", 400);
      if (newPassword.length < 8) return apiError("New password must be at least 8 characters", 400);
      if (newPassword.length > 128) return apiError("Password too long", 400);

      const user = await prisma.user.findUnique({ where: { id: auth.userId } });
      if (!user) return apiError("User not found", 404);

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return apiError("Current password is incorrect", 401);

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    logAudit("profile.update", auth.userId, "Updated profile", request);
    return NextResponse.json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    console.error("Error updating profile:", error);
    return apiError("Internal server error", 500);
  }
}
