import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSecuritySettings } from "@/lib/security-settings";
import { logAudit, validateEmail } from "@/lib/security";
import { signToken } from "@/lib/auth";

// In-memory rate limiting store
const signupAttempts = new Map<string, { count: number; time: number }>();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const settings = getSecuritySettings();

    if (!settings.allowRegistration) {
      return NextResponse.json({ message: "Registration is currently disabled" }, { status: 403 });
    }

    // IP-based rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const signupEntry = signupAttempts.get(ip);
    if (signupEntry && now - signupEntry.time > settings.signupWindowMinutes * 60 * 1000) {
      signupAttempts.delete(ip);
    }
    const canSignup = signupEntry ? signupEntry.count < settings.signupMaxAttempts : true;
    if (!canSignup) {
      return NextResponse.json({ message: "Too many registration attempts. Please try again later." }, { status: 429 });
    }

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Password policy checks
    if (password.length < settings.passwordMinLength) {
      return NextResponse.json({ message: `Password must be at least ${settings.passwordMinLength} characters` }, { status: 400 });
    }
    if (password.length > settings.passwordMaxLength) {
      return NextResponse.json({ message: `Password must not exceed ${settings.passwordMaxLength} characters` }, { status: 400 });
    }
    if (settings.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      return NextResponse.json({ message: "Password must contain at least one uppercase letter" }, { status: 400 });
    }
    if (settings.passwordRequireLowercase && !/[a-z]/.test(password)) {
      return NextResponse.json({ message: "Password must contain at least one lowercase letter" }, { status: 400 });
    }
    if (settings.passwordRequireNumbers && !/[0-9]/.test(password)) {
      return NextResponse.json({ message: "Password must contain at least one number" }, { status: 400 });
    }
    if (settings.passwordRequireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json({ message: "Password must contain at least one special character" }, { status: 400 });
    }

    const sanitizedName = name ? name.trim().replace(/<[^>]*>/g, "").substring(0, 100) : "";

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ message: "An account with this email already exists" }, { status: 409 });
    }

    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "ADMIN" : "EDITOR";

    if (role === "ADMIN") {
      await prisma.user.updateMany({ where: { role: "ADMIN" }, data: { role: "EDITOR" } });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const current = signupAttempts.get(ip) || { count: 0, time: Date.now() };
    signupAttempts.set(ip, { count: current.count + 1, time: Date.now() });

    const user = await prisma.user.create({
      data: {
        name: sanitizedName || cleanEmail.split("@")[0],
        email: cleanEmail,
        password: hashedPassword,
        role,
      },
    });

    logAudit("signup.success", user.id, `New account created: ${user.email} (${role})`, request);

    // Generate JWT
    const token = await signToken(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      settings.sessionTimeoutHours
    );

    const response = NextResponse.json(
      {
        message: "Account created successfully",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: settings.sessionTimeoutHours * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Registration failed. Please try again." }, { status: 500 });
  }
}
