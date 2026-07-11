import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEmail } from "@/lib/security";
import {
  generateVerificationToken,
  sendEmail,
  buildVerificationEmailHtml,
} from "@/lib/email";
import { getSettings, isSmtpConfigured } from "@/lib/settings-store";

// In-memory rate limiting for public subscribe endpoint
const subscribeAttempts = new Map<string, { count: number; time: number }>();

const SUBSCRIBE_MAX_ATTEMPTS = 5;
const SUBSCRIBE_WINDOW_MINUTES = 15;

// GET all subscribers (admin only)
export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subscriber.count({ where }),
    ]);

    return NextResponse.json({
      subscribers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create subscriber (public) — with rate limiting, validation & double opt-in
export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // IP-based rate limiting to prevent abuse
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const entry = subscribeAttempts.get(ip);
    if (entry && now - entry.time > SUBSCRIBE_WINDOW_MINUTES * 60 * 1000) {
      subscribeAttempts.delete(ip);
    }
    const canAttempt = entry ? entry.count < SUBSCRIBE_MAX_ATTEMPTS : true;
    if (!canAttempt) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const existing = await prisma.subscriber.findUnique({ where: { email: cleanEmail } });

    if (existing) {
      if (!existing.isActive) {
        const updated = await prisma.subscriber.update({
          where: { email: cleanEmail },
          data: { isActive: true },
        });
        return NextResponse.json({ message: "Subscription reactivated", subscriber: updated }, { status: 200 });
      }
      return NextResponse.json({ error: "Email already subscribed" }, { status: 409 });
    }

    // Track successful attempt
    const current = subscribeAttempts.get(ip) || { count: 0, time: Date.now() };
    subscribeAttempts.set(ip, { count: current.count + 1, time: Date.now() });

    const sanitizedName = name ? name.trim().replace(/<[^>]*>/g, "").substring(0, 100) : null;

    // Check if double opt-in is enabled and SMTP is configured
    const settings = getSettings();
    const doubleOptInEnabled = settings.enableDoubleOptIn && isSmtpConfigured();

    if (doubleOptInEnabled) {
      // Generate verification token before creating subscriber
      const verificationToken = generateVerificationToken();

      const subscriber = await prisma.subscriber.create({
        data: {
          email: cleanEmail,
          name: sanitizedName,
          isVerified: false,
          verificationToken,
        },
      });

      // Send verification email
      let verificationSent = false;
      try {
        const verifyUrl = `${settings.siteUrl || "https://example.com"}/api/subscribe/verify?token=${verificationToken}`;
        const siteName = settings.siteName || "Our Blog";

        await sendEmail({
          to: subscriber.email,
          subject: `Confirm your subscription to ${siteName}`,
          html: buildVerificationEmailHtml(siteName, verifyUrl),
        });
        verificationSent = true;
      } catch (emailErr) {
        console.error("Failed to send verification email:", emailErr);
      }

      return NextResponse.json({
        message: verificationSent
          ? "Please check your email to confirm your subscription"
          : "Subscribed, but verification email could not be sent. Please contact support.",
        subscriber: { ...subscriber, verificationSent },
      }, { status: 201 });
    }

    // No double opt-in - create subscriber directly as verified & active
    const subscriber = await prisma.subscriber.create({
      data: {
        email: cleanEmail,
        name: sanitizedName,
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Subscribed successfully", subscriber }, { status: 201 });
  } catch (error) {
    console.error("Error subscribing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
