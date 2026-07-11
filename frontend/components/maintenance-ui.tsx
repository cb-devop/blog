"use client";

import { useEffect, useState } from "react";
import { Wrench, RefreshCw, Clock, Terminal, ChevronRight, AlertTriangle, Mail } from "lucide-react";
import Link from "next/link";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@premiumblog.com";

export default function MaintenanceUI() {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [dots, setDots] = useState("");

  const statusMessages = [
    "Running system diagnostics...",
    "Upgrading database schemas...",
    "Optimizing asset pipelines...",
    "Running security patches...",
    "Verifying data integrity...",
    "Almost done, final checks...",
  ];

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 3 + 0.5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Status message cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [statusMessages.length]);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    setCurrentTime(formatTime());
    const interval = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px] animate-pulse delay-500" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          {/* Terminal Card */}
          <div className="rounded-2xl border border-muted-foreground/20 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 hover:border-primary/30">
            {/* Terminal Header */}
            <div className="border-b border-muted-foreground/10 bg-gradient-to-r from-background via-muted/30 to-background">
              <div className="flex items-center gap-2 px-5 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-3 text-xs font-mono text-muted-foreground">
                  admin@server:~/maintenance
                </span>
                <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <Clock className="h-3 w-3" />
                  <span>{currentTime}</span>
                  <span className="text-emerald-500">UTC</span>
                </div>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Icon & Title */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-4 animate-bounce">
                  <Wrench className="h-8 w-8 text-amber-500" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground font-mono">
                  <span className="text-amber-500">$</span> Under Maintenance
                </h1>
                <p className="text-muted-foreground mt-2 font-mono text-sm">
                  We&apos;re currently performing scheduled upgrades
                </p>
              </div>

              {/* Status Messages */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-muted/50 border border-muted-foreground/10 font-mono text-sm">
                  <div className="flex items-start gap-3">
                    <Terminal className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-2">
                      <div className="text-foreground">
                        <span className="text-emerald-500 dark:text-emerald-400">$</span>{" "}
                        ./run_maintenance.sh
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                        <span>{statusMessages[statusIndex]}</span>
                        <span className="animate-pulse text-primary">{dots}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="text-violet-500">[INFO]</span> Estimated completion:{" "}
                        {Math.max(1, Math.round((100 - progress) / 5))} minutes remaining
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-primary font-semibold">
                    {Math.min(100, Math.round(progress))}%
                  </span>
                </div>
                <div className="relative h-2.5 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-violet-500 to-amber-500 transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  <span>Please do not close this page or navigate away</span>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
                  <div className="flex items-center gap-2 text-sm font-mono">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-medium">Expected Downtime</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    ~{Math.max(1, Math.round((100 - progress) / 5))} minutes
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
                  <div className="flex items-center gap-2 text-sm font-mono">
                    <Mail className="h-4 w-4 text-amber-500" />
                    <span className="text-foreground font-medium">Contact Support</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{ADMIN_EMAIL}</p>
                </div>
              </div>

              {/* Footer Links */}
              <div className="pt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground font-mono">
                <Link
                  href={`mailto:${ADMIN_EMAIL}`}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Mail className="h-3 w-3" />
                  Email Us
                </Link>
                <span className="text-muted-foreground/30">|</span>
                <div className="flex items-center gap-1">
                  <RefreshCw className={`h-3 w-3 ${progress < 100 ? "animate-spin" : ""}`} />
                  Auto-refreshing
                </div>
              </div>

              {/* Auto-redirect notice */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-muted-foreground/10 text-xs text-muted-foreground font-mono">
                  <ChevronRight className="h-3 w-3 text-primary" />
                  <span>
                    Will automatically redirect when maintenance is complete
                  </span>
                  <RefreshCw className="h-3 w-3 ml-1 text-primary animate-spin" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
