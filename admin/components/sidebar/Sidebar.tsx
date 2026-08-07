"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Tags,
  User,
  UserCog,
  BookOpen,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Posts", href: "/dashboard/posts", icon: FileText },
  { label: "AI Writer", href: "/dashboard/ai-writer", icon: Sparkles },
  { label: "Categories", href: "/dashboard/categories", icon: Layers },
  { label: "Tags", href: "/dashboard/tags", icon: Tags },
  { label: "Users", href: "/dashboard/users", icon: UserCog },
  { label: "Messages", href: "/dashboard/contact-messages", icon: MessageSquare },
  { label: "Comments", href: "/dashboard/comments", icon: MessageSquare },
  { label: "Newsletter", href: "/dashboard/newsletter", icon: Mail },
  { label: "Security", href: "/dashboard/security", icon: Shield },
  { label: "Subscribers", href: "/dashboard/newsletter/subscribers", icon: Users },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [pendingComments, setPendingComments] = useState<number | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<number | null>(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const [commentsRes, msgsRes] = await Promise.all([
          fetch("/api/comments?status=pending&limit=1"),
          fetch("/api/contact?limit=1"),
        ]);
        if (commentsRes.ok) {
          const data = await commentsRes.json();
          setPendingComments(data.pagination?.total ?? null);
        }
        if (msgsRes.ok) {
          const data = await msgsRes.json();
          // messages is an array; count those with isRead === false
          const list = data.messages || data || [];
          const unread = Array.isArray(list)
            ? list.filter((m: any) => !m.isRead).length
            : data.pagination?.total ?? 0;
          setUnreadMessages(unread);
        }
      } catch {}
    };
    fetchPending();
    // Poll every 30s
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card",
        className
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 border-b px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="h-4 w-4" />
        </div>
        <Link href="/dashboard" className="text-lg font-bold text-foreground">
          Premium Portal
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const isComments = item.href === "/dashboard/comments";
          const isMessages = item.href === "/dashboard/contact-messages";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "bg-transparent text-muted-foreground group-hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <span className="flex-1">{item.label}</span>
              {isComments && pendingComments !== null && pendingComments > 0 && (
                <span className="flex-shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-bold font-mono">
                  {pendingComments > 99 ? "99+" : pendingComments}
                </span>
              )}
              {isMessages && unreadMessages !== null && unreadMessages > 0 && (
                <span className="flex-shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold font-mono animate-pulse">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <a
          href="/auth/login"
          onClick={(e) => { e.preventDefault(); document.cookie = "admin_token=; path=/; max-age=0"; window.location.href = "/auth/login"; }}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </a>
      </div>
    </aside>
  );
}