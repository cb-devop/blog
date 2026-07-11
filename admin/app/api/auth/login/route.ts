import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSecuritySettings } from "@/lib/security-settings";
import { logAudit, validateEmail } from "@/lib/security";
import { signToken } from "@/lib/auth";

// In-memory rate limiting store
const loginAttempts = new Map<string, { count: number; time: number }>();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const settings = getSecuritySettings();

    // Rate limiting
    const now = Date.now();
    const entry = loginAttempts.get(cleanEmail);
    if (entry && now - entry.time > settings.loginWindowMinutes * 60 * 1000) {
      loginAttempts.delete(cleanEmail);
    }
    const canAttempt = entry ? entry.count < settings.loginMaxAttempts : true;
    if (!canAttempt) {
      return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    const current = loginAttempts.get(cleanEmail) || { count: 0, time: Date.now() };

    if (!user) {
      loginAttempts.set(cleanEmail, { count: current.count + 1, time: Date.now() });
      logAudit("login.failed", "unknown", `Failed login attempt for ${cleanEmail} (user not found)`, request);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      loginAttempts.set(cleanEmail, { count: current.count + 1, time: Date.now() });
      logAudit("login.failed", user.id, `Failed login attempt for ${cleanEmail} (wrong password)`, request);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    loginAttempts.delete(cleanEmail);
    logAudit("login.success", user.id, `Admin login by ${user.email}`, request);

    if (user.role === "BANNED") {
      logAudit("login.blocked", user.id, `Blocked login for banned account ${user.email}`, request);
      return NextResponse.json({ message: "Account has been deactivated" }, { status: 403 });
    }

    if (!settings.allowRegistration && user.role !== "ADMIN") {
      logAudit("login.blocked", user.id, `Blocked login - registration disabled for ${user.email}`, request);
      return NextResponse.json({ message: "Account has been deactivated" }, { status: 403 });
    }

    // Generate JWT
    const token = await signToken(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      settings.sessionTimeoutHours
    );

    const response = NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: settings.sessionTimeoutHours * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Login failed. Please try again." }, { status: 500 });
  }
}
