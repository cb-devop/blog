import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, logAudit, validateString } from "@/lib/security";
import { getSettings, isSmtpConfigured } from "@/lib/settings-store";
import { sendEmail, buildContactNotificationHtml } from "@/lib/email";
import { pushNotification } from "@/lib/notifications";

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.contactMessage.count(),
    ]);

    return NextResponse.json({ messages, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();
    if (!name || !email || !message) return apiError("Name, email, and message are required", 400);
    if (!email.includes("@")) return apiError("Invalid email address", 400);

    const cleanName = validateString(name, 100);
    const cleanEmail = email.toLowerCase().trim();
    const cleanSubject = subject ? validateString(subject, 200) : null;
    const cleanMessage = validateString(message, 5000);

    const contact = await prisma.contactMessage.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
      },
    });

    // --- Notify the admin ---
    notifyAdminOfContactMessage({ id: contact.id, name: cleanName, email: cleanEmail, subject: cleanSubject, message: cleanMessage });

    return NextResponse.json({ message: "Message sent successfully", id: contact.id }, { status: 201 });
  } catch (error) {
    console.error("Error saving contact message:", error);
    return apiError("Internal server error", 500);
  }
}

/** Fire admin notifications (in-app + email). Runs in background, never blocks the response. */
function notifyAdminOfContactMessage(data: {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}) {
  const settings = getSettings();
  const adminUrl = settings.siteUrl?.replace(/\/$/, "") || "http://localhost:3001";
  const messageUrl = `${adminUrl}/dashboard/contact-messages`;

  const subjectLine = data.subject || "(No subject)";

  // 1) In-app notification (live badge / dropdown in dashboard)
  pushNotification({
    type: "contact_message",
    title: `New message from ${data.name}`,
    message: subjectLine,
    link: "/dashboard/contact-messages",
    meta: { id: data.id, email: data.email },
  });

  // 2) Email notification to admin (if SMTP configured)
  if (isSmtpConfigured() && settings.adminEmail) {
    sendEmail({
      to: settings.adminEmail,
      subject: `[${settings.siteName}] New contact message: ${subjectLine}`,
      html: buildContactNotificationHtml(settings.siteName, {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        messageUrl,
      }),
    }).catch((err) => {
      console.error("Failed to send contact notification email:", err);
    });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);
    const { id, isRead } = await request.json();
    if (!id) return apiError("Message ID is required", 400);
    await prisma.contactMessage.update({ where: { id }, data: { isRead: isRead ?? true } });
    logAudit("message.read", auth.userId, `Marked message as read: ${id}`, request);
    return NextResponse.json({ message: "Message updated" });
  } catch (error) {
    console.error("Error updating message:", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);
    const { id } = await request.json();
    if (!id) return apiError("Message ID is required", 400);
    await prisma.contactMessage.delete({ where: { id } });
    logAudit("message.delete", auth.userId, `Deleted message: ${id}`, request);
    return NextResponse.json({ message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return apiError("Internal server error", 500);
  }
}
