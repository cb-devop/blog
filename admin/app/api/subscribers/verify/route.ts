import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildWelcomeEmailHtml } from "@/lib/email";
import { getSettings } from "@/lib/settings-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Verification token is required", valid: false },
        { status: 400 }
      );
    }

    // Find subscriber by verification token
    const subscriber = await prisma.subscriber.findUnique({
      where: { verificationToken: token },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Invalid or expired verification token", valid: false },
        { status: 404 }
      );
    }

    if (subscriber.isVerified) {
      return NextResponse.json({
        message: "Email already verified",
        valid: true,
        alreadyVerified: true,
      });
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { error: "This subscription has been deactivated", valid: false },
        { status: 410 }
      );
    }

    // Mark as verified
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Send welcome email
    const settings = getSettings();
    const siteName = settings.siteName || "Our Blog";
    await sendEmail({
      to: subscriber.email,
      subject: `Welcome to ${siteName}! 🎉`,
      html: buildWelcomeEmailHtml(siteName),
    });

    return NextResponse.json({
      message: "Email verified successfully!",
      valid: true,
      alreadyVerified: false,
    });
  } catch (error) {
    console.error("Error verifying subscriber:", error);
    return NextResponse.json(
      { error: "Failed to verify subscription", valid: false },
      { status: 500 }
    );
  }
}
