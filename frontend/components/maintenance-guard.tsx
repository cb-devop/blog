"use client";

import { useEffect, useState } from "react";
import MaintenanceUI from "@/components/maintenance-ui";

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch("/api/maintenance-status");
        const data = await res.json();
        setMaintenanceMode(data.maintenanceMode);
      } catch {
        // If API fails, assume normal operation
        setMaintenanceMode(false);
      }
    };

    checkMaintenance();

    // Re-check every 30 seconds for changes to maintenance mode
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, []); // Only runs on mount

  // Show nothing while checking (prevents flash)
  if (maintenanceMode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span>Checking server status...</span>
        </div>
      </div>
    );
  }

  // If maintenance mode is on, show maintenance page
  if (maintenanceMode) {
    return <MaintenanceUI />;
  }

  // Normal operation
  return <>{children}</>;
}
