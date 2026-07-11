import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin, apiError, logAudit, validateString, validateEmail } from "@/lib/security";

// GET: List all users (admin only)
export async function GET(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth) return apiError("Unauthorized", 401);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return apiError("Internal server error", 500);
  }
}

// POST: Create a new user (admin only)
export async function POST(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { name, email, password, role } = await request.json();

    if (!email || !password) {
      return apiError("Email and password are required", 400);
    }

    if (!validateEmail(email)) {
      return apiError("Invalid email format", 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 8) {
      return apiError("Password must be at least 8 characters", 400);
    }

    if (password.length > 128) {
      return apiError("Password too long", 400);
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return apiError("A user with this email already exists", 409);
    }

    // Validate role
    const allowedRoles = ["ADMIN", "EDITOR", "BANNED"];
    const userRole = allowedRoles.includes(role) ? role : "EDITOR";

    // Enforce only ONE admin rule
    if (userRole === "ADMIN") {
      // Demote existing admin(s) to EDITOR
      await prisma.user.updateMany({
        where: { role: "ADMIN" },
        data: { role: "EDITOR" },
      });
    }

    const sanitizedName = validateString(name || cleanEmail.split("@")[0], 100);
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    logAudit("user.create", auth.userId, `Created user: ${user.email} (${user.role})`, request);
    return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return apiError("Internal server error", 500);
  }
}
