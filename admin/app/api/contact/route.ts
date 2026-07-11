import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiError, logAudit, validateString } from "@/lib/security";

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

    const contact = await prisma.contactMessage.create({
      data: {
        name: validateString(name, 100),
        email: email.toLowerCase().trim(),
        subject: subject ? validateString(subject, 200) : null,
        message: validateString(message, 5000),
      },
    });

    return NextResponse.json({ message: "Message sent successfully", id: contact.id }, { status: 201 });
  } catch (error) {
    console.error("Error saving contact message:", error);
    return apiError("Internal server error", 500);
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
