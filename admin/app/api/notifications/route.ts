import { NextResponse } from "next/server";
import { requireAuth, apiError, logAudit } from "@/lib/security";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (!auth) return apiError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  return NextResponse.json({
    notifications: getNotifications(limit),
    unread: getUnreadCount(),
  });
}

export async function PUT(request: Request) {
  const auth = requireAuth(request);
  if (!auth) return apiError("Unauthorized", 401);

  const data = await request.json().catch(() => ({}));
  if (data.all) {
    markAllNotificationsRead();
    logAudit("notifications.read_all", auth.userId, "Marked all notifications as read", request);
    return NextResponse.json({ message: "All notifications marked as read", unread: 0 });
  }
  if (!data.id) return apiError("Notification ID or 'all' flag is required", 400);
  markNotificationRead(data.id);
  return NextResponse.json({ message: "Notification marked as read", unread: getUnreadCount() });
}
