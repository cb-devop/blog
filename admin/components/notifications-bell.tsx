"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, Mail, MessageSquare, X, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const firstLoadRef = useRef(true);

  // Poll for notifications every 15s
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=10");
      if (!res.ok) return;
      const data = await res.json();
      const next: AppNotification[] = data.notifications || [];

      // Detect brand-new notifications to show as a toast — but only after
      // the first load so we don't spam toasts for existing items on mount.
      if (!firstLoadRef.current) {
        const newOnes = next.filter(
          (n) => !n.isRead && !seenIds.has(n.id)
        );
        if (newOnes.length > 0) {
          setToasts((t) => [...t, ...newOnes].slice(-5));
        }
      }
      setSeenIds(new Set(next.map((n) => n.id)));
      setItems(next);
      setUnread(data.unread ?? 0);
      firstLoadRef.current = false;
    } catch {
      // ignore
    }
  }, [seenIds]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-dismiss toasts
  useEffect(() => {
    if (toasts.length === 0) return;
    const t = setTimeout(() => setToasts([]), 6000);
    return () => clearTimeout(t);
  }, [toasts]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {}
  };

  const handleItemClick = (n: AppNotification) => {
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const iconFor = (type: string) => {
    if (type === "contact_message") return <Mail className="h-4 w-4 text-primary" />;
    if (type === "comment") return <MessageSquare className="h-4 w-4 text-yellow-500" />;
    return <Bell className="h-4 w-4 text-muted-foreground" />;
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const dismissToast = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-muted transition-colors relative"
          title={unread > 0 ? `${unread} new notifications` : "Notifications"}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold font-mono ring-2 ring-background animate-pulse">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-sm font-semibold text-foreground">
                Notifications {unread > 0 && <span className="text-primary">({unread} new)</span>}
              </span>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors flex gap-3 items-start",
                      !n.isRead && "bg-primary/5"
                    )}
                  >
                    <div className="mt-0.5">{iconFor(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm truncate", !n.isRead ? "font-semibold text-foreground" : "text-foreground")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5 font-mono">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>

            <div className="border-t p-2 text-center">
              <Link
                href="/dashboard/contact-messages"
                onClick={() => setOpen(false)}
                className="block w-full py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all messages
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications (top-right, auto-dismiss) */}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[90vw]">
        {toasts.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-border bg-popover shadow-lg animate-fade-in"
          >
            <div className="mt-0.5">{iconFor(n.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
              <p className="text-xs text-muted-foreground truncate">{n.message}</p>
              {n.link && (
                <Link
                  href={n.link}
                  onClick={() => { dismissToast(n.id); }}
                  className="text-xs text-primary hover:underline mt-1 inline-block"
                >
                  View &rarr;
                </Link>
              )}
            </div>
            <button
              onClick={() => dismissToast(n.id)}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
