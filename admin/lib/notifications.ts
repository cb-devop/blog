// In-memory notification store (shared across routes, like audit log).
// For multi-instance/production, swap this for a DB table or Redis.

export type NotificationType =
  | "contact_message"
  | "comment"
  | "subscriber"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string; // ISO string (serializable for API responses)
  meta?: Record<string, unknown>;
}

let notifications: AppNotification[] = [];

function nextId(): string {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function pushNotification(
  input: Omit<AppNotification, "id" | "isRead" | "createdAt">
): AppNotification {
  const n: AppNotification = {
    id: nextId(),
    isRead: false,
    createdAt: new Date().toISOString(),
    ...input,
  };
  notifications.unshift(n);
  // Cap to last 100
  if (notifications.length > 100) {
    notifications = notifications.slice(0, 100);
  }
  return n;
}

export function getNotifications(limit = 20): AppNotification[] {
  return notifications.slice(0, limit);
}

export function getUnreadCount(): number {
  return notifications.filter((n) => !n.isRead).length;
}

export function markNotificationRead(id: string): void {
  const n = notifications.find((x) => x.id === id);
  if (n) n.isRead = true;
}

export function markAllNotificationsRead(): void {
  notifications.forEach((n) => (n.isRead = true));
}

export function clearNotifications(): void {
  notifications = [];
}
