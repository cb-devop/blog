"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { 
  Moon, Sun, Menu, X, 
  Search, Rss, Mail, Check, Loader2, XCircle, Terminal 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { LiveLogo } from "@/components/live-logo";

function SubscribeButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess(true);
        setEmail("");
        setTimeout(() => { setOpen(false); setSuccess(false); }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Subscription failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hidden md:relative md:flex">
      {!open ? (
        <button onClick={() => setOpen(true)} className="terminal-btn">
          <Rss className="h-4 w-4" />
          ./subscribe.sh
        </button>
      ) : (
        <div className="absolute right-0 top-full mt-2 w-80 terminal-window z-50">
          <div className="terminal-titlebar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">newsletter.sh</span>
            <button type="button" onClick={() => { setOpen(false); setError(""); }} className="text-muted-foreground hover:text-foreground ml-auto">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
          <div className="terminal-body">
            {success ? (
              <div className="text-center py-3">
                <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-terminal-text font-mono">✓ Subscribed successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <p className="terminal-line">
                  <span className="prompt">$</span>
                  <span className="cmd">Enter email to subscribe</span>
                </p>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="font-mono text-sm"
                />
                {error && <p className="text-xs text-red-500 font-mono">✗ {error}</p>}
                <button type="submit" disabled={loading} className="terminal-btn primary w-full justify-center">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {loading ? "./processing.sh" : "./subscribe.sh"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileSubscribe() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSuccess(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-sm text-terminal-text py-2 font-mono">
        <Check className="h-4 w-4" />
        ✓ Subscribed!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="flex gap-2 mt-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
        required
        className="flex-1 font-mono text-sm"
      />
      <button type="submit" disabled={loading} className="terminal-btn">
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rss className="h-3 w-3" />}
      </button>
    </form>
  );
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Live Animated Logo */}
          <LiveLogo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="terminal-line px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
              >
                <span className="prompt">$</span>
                <span className="cmd hover:text-terminal-text transition-colors">{link.label.toLowerCase()}.sh</span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="terminal-btn hidden md:flex"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="terminal-btn"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Subscribe Button */}
            <SubscribeButton />

            {/* Mobile Menu Toggle */}
            <button
              className="terminal-btn md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar (Collapsible) */}
        {searchOpen && (
          <div className="py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-terminal-prompt font-mono text-sm">$</span>
              <span className="text-muted-foreground font-mono text-sm">find /articles -name</span>
              <div className="relative flex-1">
                <Input
                  placeholder="search query..."
                  className="font-mono text-sm pl-2"
                />
                <span className="terminal-cursor absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-border">
            <div className="terminal-titlebar mb-2">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-title">menu.sh</span>
            </div>
            <nav className="flex flex-col gap-1 p-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="terminal-line px-3 py-2 rounded-md hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="prompt">$</span>
                  <span className="cmd">{link.label.toLowerCase()}.sh</span>
                </Link>
              ))}
              <MobileSubscribe />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}