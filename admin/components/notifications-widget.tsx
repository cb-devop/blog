"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Bell, ChevronRight, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationsWidget() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await fetch("/api/notifications?limit=5");
        if (res.ok) {
          const data = await res.json();
          setItems(data.notifications || []);
          setUnread(data.unread ?? 0);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 20000);
    return () => clearInterval(interval);
  }, []);

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

  const iconFor = (type: string) => {
    if (type === "contact_message") return <Mail className="h-4 w-4 text-primary" />;
    if (type === "comment") return <MessageSquare className="h-4 w-4 text-yellow-500" />;
    return <Bell className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">Recent Notifications</h3>
          {unread > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold font-mono">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Bell className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">No notifications yet</p>
          <p className="text-xs mt-1">New contact messages will appear here.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.link || "/dashboard/contact-messages"}
              className={`flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors ${!n.isRead ? "bg-primary/5" : ""}`}
            >
              <div className="mt-0.5">{iconFor(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${!n.isRead ? "font-semibold text-foreground" : "text-foreground"}`}>
                  {n.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5 font-mono">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
            </Link>
          ))}
          <Link
            href="/dashboard/contact-messages"
            className="flex items-center justify-center gap-1 pt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all messages <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </Card>
  );
}
