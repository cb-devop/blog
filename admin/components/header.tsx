"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, Moon, Sun, Menu, LogOut, X, LayoutDashboard, FileText, Layers, Tags, 
  UserCog, MessageSquare, Mail, Shield, Users, User, Settings, BookOpen
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NotificationsBell } from '@/components/notifications-bell';

interface User {
  name: string;
  email: string;
}

const mobileNavItems = [
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

export function Header({ user }: { user: User }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [pendingComments, setPendingComments] = useState<number>(0);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Close mobile nav on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fetch pending comments count for notification
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch("/api/comments?status=pending&limit=1");
        if (res.ok) {
          const data = await res.json();
          setPendingComments(data.pagination?.total ?? 0);
        }
      } catch {}
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    document.cookie = "admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/auth/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b shadow-sm">
        <div className="flex items-center justify-between h-16 px-3 sm:px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Brand on mobile */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-foreground">Portal</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center max-w-md flex-1 mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts, pages..."
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="hidden sm:block">
              <NotificationsBell />
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-1.5 sm:gap-3 pl-1.5 sm:pl-2 border-l border-border">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-semibold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden px-3 pb-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts, pages..."
                className="pl-10 bg-muted/50"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-xl animate-fade-in md:hidden">
            <div className="flex items-center gap-2 border-b px-4 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-foreground">Premium Portal</span>
            </div>
            <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto max-h-[calc(100vh-60px)]">
              {mobileNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const isComments = item.href === "/dashboard/comments";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isComments && pendingComments > 0 && (
                      <span className="flex-shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-bold">
                        {pendingComments > 99 ? "99+" : pendingComments}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t p-3">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >                        <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}