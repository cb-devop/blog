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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Posts", href: "/dashboard/posts", icon: FileText },
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

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch("/api/comments?status=pending&limit=1");
        if (res.ok) {
          const data = await res.json();
          setPendingComments(data.pagination?.total ?? null);
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
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground">
          <p className="text-sm font-semibold">Upgrade to Pro</p>
          <p className="mt-1 text-xs text-primary-foreground/80">
            Unlock advanced analytics & automation.
          </p>
          <button className="mt-3 w-full rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur transition-colors hover:bg-white/25">
            Learn more
          </button>
        </div>
        <a
          href="/auth/login"
          onClick={(e) => { e.preventDefault(); document.cookie = "admin_token=; path=/; max-age=0"; window.location.href = "/auth/login"; }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </a>
      </div>
    </aside>
  );
}