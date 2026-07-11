"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield, AlertTriangle, Activity, UserCheck, Search, RefreshCw,
  Clock, Fingerprint, Globe, Terminal, ChevronDown, ChevronUp, Copy, Check,
  Save, Lock, Key, Users, LogIn, FileText, GlobeLock,
  Fingerprint as FingerprintIcon, Server
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

interface AuditEntry {
  action: string;
  userId: string;
  details: string;
  timestamp: string;
  ip: string;
}

interface SecuritySettings {
  loginMaxAttempts: number;
  loginWindowMinutes: number;
  signupMaxAttempts: number;
  signupWindowMinutes: number;
  passwordMinLength: number;
  passwordMaxLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  sessionTimeoutHours: number;
  maxConcurrentSessions: number;
  auditLogEnabled: boolean;
  auditLogMaxEntries: number;
  allowRegistration: boolean;
  enableTwoFactorAuth: boolean;
  enableHSTS: boolean;
  enableXFrameOptions: boolean;
  enableXSSProtection: boolean;
  enableCSP: boolean;
}

const defaultSettings: SecuritySettings = {
  loginMaxAttempts: 5,
  loginWindowMinutes: 15,
  signupMaxAttempts: 3,
  signupWindowMinutes: 60,
  passwordMinLength: 8,
  passwordMaxLength: 128,
  passwordRequireUppercase: false,
  passwordRequireLowercase: false,
  passwordRequireNumbers: false,
  passwordRequireSpecialChars: false,
  sessionTimeoutHours: 24,
  maxConcurrentSessions: 5,
  auditLogEnabled: true,
  auditLogMaxEntries: 1000,
  allowRegistration: true,
  enableTwoFactorAuth: false,
  enableHSTS: true,
  enableXFrameOptions: true,
  enableXSSProtection: true,
  enableCSP: false,
};

type TabName = "settings" | "logs";

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<TabName>("settings");
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Audit log state
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const limit = 15;

  // Fetch security settings
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/security-settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch security settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Fetch audit logs
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (actionFilter) params.set("action", actionFilter);
      const res = await fetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setLogsError(data.error || `API error: ${res.status}`);
        setLogs([]);
      } else {
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      setLogsError("Network error - could not reach server");
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    }
  }, [activeTab, fetchLogs]);

  // Auto-refresh logs every 30 seconds when on logs tab
  useEffect(() => {
    if (activeTab !== "logs") return;
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [activeTab, fetchLogs]);

  // Save security settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/security-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        toast({
          title: "Security settings saved",
          description: "Your security configuration has been updated successfully.",
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save security settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Audit log helpers
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.userId.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase()) ||
    log.ip.toLowerCase().includes(search.toLowerCase())
  );

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes("delete")) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (action.includes("create")) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (action.includes("update") || action.includes("edit")) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (action.includes("login")) return "text-violet-500 bg-violet-500/10 border-violet-500/20";
    if (action.includes("password")) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-gray-500 bg-gray-500/10 border-gray-500/20";
  };

  const actionTypes = [
    { value: "", label: "All Actions" },
    { value: "delete", label: "Deletions" },
    { value: "create", label: "Creations" },
    { value: "update", label: "Updates" },
    { value: "login", label: "Logins" },
    { value: "password", label: "Password Changes" },
  ];

  // Compute dynamic security status
  const getSecurityStatus = () => {
    const checks = [];
    if (settings.enableHSTS) checks.push(true); else checks.push(false);
    if (settings.enableXFrameOptions) checks.push(true); else checks.push(false);
    if (settings.enableXSSProtection) checks.push(true); else checks.push(false);
    if (settings.passwordMinLength >= 8) checks.push(true); else checks.push(false);
    if (settings.loginMaxAttempts <= 10) checks.push(true); else checks.push(false);

    const score = checks.filter(Boolean).length;
    const total = checks.length;
    if (score === total) return { label: "Protected", color: "text-emerald-500", dot: "bg-emerald-500" };
    if (score >= total * 0.6) return { label: "Moderate", color: "text-amber-500", dot: "bg-amber-500" };
    return { label: "At Risk", color: "text-red-500", dot: "bg-red-500" };
  };

  const status = getSecurityStatus();

  // Loading skeleton for settings
  if (settingsLoading) {
    return (
      <div className="p-6 space-y-8 min-h-screen">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
            <Shield className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Security Dashboard</h1>
            <p className="text-muted-foreground mt-1">Loading security settings...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-12 bg-muted rounded-lg" />
            </Card>
          ))}
        </div>
        <Card className="p-6 animate-pulse">
          <div className="h-64 bg-muted rounded-lg" />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Security Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Configure security settings and monitor audit logs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-muted-foreground/10 w-fit">
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "settings"
              ? "bg-background text-foreground shadow-sm border border-muted-foreground/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lock className="h-4 w-4" />
          Security Settings
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "logs"
              ? "bg-background text-foreground shadow-sm border border-muted-foreground/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="h-4 w-4" />
          Audit Logs
        </button>
      </div>

      {activeTab === "settings" ? (
        <>
          {/* Security Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-2.5 w-2.5 rounded-full ${status.dot} animate-pulse`} />
                    <p className={`text-lg font-bold ${status.color}`}>{status.label}</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Shield className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Password Policy</p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    Min. {settings.passwordMinLength} chars
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Key className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rate Limiting</p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {settings.loginMaxAttempts} / {settings.loginWindowMinutes}m
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <LogIn className="h-5 w-5 text-violet-500" />
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Session Timeout</p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {settings.sessionTimeoutHours}h
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Settings Form */}
          <div className="space-y-6">
            {/* Rate Limiting */}
            <Card className="p-6 border-muted-foreground/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <AlertTriangle className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Rate Limiting</h2>
                  <p className="text-sm text-muted-foreground">Configure rate limiting thresholds to prevent abuse</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Login Max Attempts
                  </label>
                  <div className="relative">
                    <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={settings.loginMaxAttempts}
                      onChange={(e) => updateSetting("loginMaxAttempts", Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Max failed attempts before lockout</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Login Window (minutes)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      max={1440}
                      value={settings.loginWindowMinutes}
                      onChange={(e) => updateSetting("loginWindowMinutes", Math.max(1, Math.min(1440, Number(e.target.value) || 1)))}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Time window for counting attempts</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Signup Max Attempts
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={settings.signupMaxAttempts}
                      onChange={(e) => updateSetting("signupMaxAttempts", Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Max registrations per IP</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Signup Window (minutes)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      max={1440}
                      value={settings.signupWindowMinutes}
                      onChange={(e) => updateSetting("signupWindowMinutes", Math.max(1, Math.min(1440, Number(e.target.value) || 1)))}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Time window for signup attempts</p>
                </div>
              </div>
            </Card>

            {/* Password Policy */}
            <Card className="p-6 border-muted-foreground/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Key className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Password Policy</h2>
                  <p className="text-sm text-muted-foreground">Define password strength requirements for users</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Min Password Length
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={4}
                      max={64}
                      value={settings.passwordMinLength}
                      onChange={(e) => updateSetting("passwordMinLength", Math.max(4, Math.min(64, Number(e.target.value) || 4)))}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Between 4 and 64 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Password Length
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={8}
                      max={256}
                      value={settings.passwordMaxLength}
                      onChange={(e) => updateSetting("passwordMaxLength", Math.max(8, Math.min(256, Number(e.target.value) || 8)))}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Between 8 and 256 characters</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <span className="text-sm text-foreground">Require Uppercase</span>
                      <p className="text-xs text-muted-foreground">A-Z</p>
                    </div>
                    <Switch
                      checked={settings.passwordRequireUppercase}
                      onCheckedChange={(v) => updateSetting("passwordRequireUppercase", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <span className="text-sm text-foreground">Require Lowercase</span>
                      <p className="text-xs text-muted-foreground">a-z</p>
                    </div>
                    <Switch
                      checked={settings.passwordRequireLowercase}
                      onCheckedChange={(v) => updateSetting("passwordRequireLowercase", v)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <span className="text-sm text-foreground">Require Numbers</span>
                      <p className="text-xs text-muted-foreground">0-9</p>
                    </div>
                    <Switch
                      checked={settings.passwordRequireNumbers}
                      onCheckedChange={(v) => updateSetting("passwordRequireNumbers", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <span className="text-sm text-foreground">Require Special Chars</span>
                      <p className="text-xs text-muted-foreground">!@#$% etc.</p>
                    </div>
                    <Switch
                      checked={settings.passwordRequireSpecialChars}
                      onCheckedChange={(v) => updateSetting("passwordRequireSpecialChars", v)}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Session & Registration */}
            <Card className="p-6 border-muted-foreground/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Users className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Session & Registration</h2>
                  <p className="text-sm text-muted-foreground">Manage user sessions and registration settings</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Session Timeout (hours)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      max={720}
                      value={settings.sessionTimeoutHours}
                      onChange={(e) => updateSetting("sessionTimeoutHours", Math.max(1, Math.min(720, Number(e.target.value) || 1)))}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Auto-logout after inactivity</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Concurrent Sessions
                  </label>
                  <div className="relative">
                    <FingerprintIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={settings.maxConcurrentSessions}
                      onChange={(e) => updateSetting("maxConcurrentSessions", Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Max simultaneous logins per user</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <span className="text-sm text-foreground">Allow Registration</span>
                      <p className="text-xs text-muted-foreground">Enable new user signups</p>
                    </div>
                    <Switch
                      checked={settings.allowRegistration}
                      onCheckedChange={(v) => updateSetting("allowRegistration", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <span className="text-sm text-foreground">Two-Factor Auth</span>
                      <p className="text-xs text-muted-foreground">Enable 2FA for all users</p>
                    </div>
                    <Switch
                      checked={settings.enableTwoFactorAuth}
                      onCheckedChange={(v) => updateSetting("enableTwoFactorAuth", v)}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Audit Log Settings */}
            <Card className="p-6 border-muted-foreground/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Activity className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Audit Logging</h2>
                  <p className="text-sm text-muted-foreground">Configure audit log behavior and retention</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <span className="text-sm text-foreground">Enable Audit Logging</span>
                    <p className="text-xs text-muted-foreground">Track all admin actions</p>
                  </div>
                  <Switch
                    checked={settings.auditLogEnabled}
                    onCheckedChange={(v) => updateSetting("auditLogEnabled", v)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Max Log Entries
                  </label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={100}
                      max={10000}
                      value={settings.auditLogMaxEntries}
                      onChange={(e) => updateSetting("auditLogMaxEntries", Math.max(100, Math.min(10000, Number(e.target.value) || 100)))}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Between 100 and 10,000 entries</p>
                </div>
              </div>
            </Card>

            {/* Security Headers */}
            <Card className="p-6 border-muted-foreground/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <GlobeLock className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Security Headers</h2>
                  <p className="text-sm text-muted-foreground">Toggle HTTP security headers for enhanced protection</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <span className="text-sm text-foreground">HSTS</span>
                    <p className="text-xs text-muted-foreground">HTTP Strict Transport Security</p>
                  </div>
                  <Switch
                    checked={settings.enableHSTS}
                    onCheckedChange={(v) => updateSetting("enableHSTS", v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <span className="text-sm text-foreground">X-Frame-Options</span>
                    <p className="text-xs text-muted-foreground">Prevent clickjacking</p>
                  </div>
                  <Switch
                    checked={settings.enableXFrameOptions}
                    onCheckedChange={(v) => updateSetting("enableXFrameOptions", v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <span className="text-sm text-foreground">X-XSS-Protection</span>
                    <p className="text-xs text-muted-foreground">Cross-site scripting filter</p>
                  </div>
                  <Switch
                    checked={settings.enableXSSProtection}
                    onCheckedChange={(v) => updateSetting("enableXSSProtection", v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <span className="text-sm text-foreground">Content-Security-Policy</span>
                    <p className="text-xs text-muted-foreground">CSP header protection</p>
                  </div>
                  <Switch
                    checked={settings.enableCSP}
                    onCheckedChange={(v) => updateSetting("enableCSP", v)}
                  />
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Security Settings
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Status Cards (shown only in logs tab) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-2.5 w-2.5 rounded-full ${status.dot} animate-pulse`} />
                    <p className={`text-lg font-bold ${status.color}`}>{status.label}</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Shield className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-lg font-bold text-foreground mt-1">{logs.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {new Set(logs.map((l) => l.userId)).size}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <UserCheck className="h-5 w-5 text-violet-500" />
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Deletion Events</p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {logs.filter((l) => l.action.includes("delete")).length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Audit Logs */}
          <Card className="overflow-hidden border-muted-foreground/20">
            {/* Terminal-style header */}
            <div className="border-b border-muted-foreground/20 bg-gradient-to-r from-background via-muted/30 to-background">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-muted-foreground/10">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-3 text-xs font-mono text-muted-foreground">
                  admin@server:~/audit/logs
                </span>
                <div className="ml-auto">
                  <Button
                    onClick={fetchLogs}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${logsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm font-mono"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {actionTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => { setActionFilter(type.value); setPage(1); }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        actionFilter === type.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-muted-foreground/20 hover:bg-muted"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Logs List */}
            <div className="divide-y divide-muted-foreground/10">
              {logsLoading && logs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg font-mono text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading audit logs...</span>
                  </div>
                </div>
              ) : logsError ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-lg font-mono text-sm text-red-500 border border-red-500/20">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{logsError}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-mono">
                    Make sure you are logged in as an ADMIN user.
                  </p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg font-mono text-sm text-muted-foreground">
                    <Terminal className="h-4 w-4" />
                    <span>No audit logs found.</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 font-mono">
                    Perform an action (login, create a post, save settings) and then refresh. Logs are stored in-memory and reset on server restart.
                  </p>
                </div>
              ) : (
                filteredLogs.map((log, idx) => (
                  <div
                    key={`${log.timestamp}-${idx}`}
                    className={`group transition-colors hover:bg-muted/30 ${
                      log.action.includes("delete") ? "bg-red-500/5" : ""
                    }`}
                  >
                    <button
                      onClick={() =>
                        setExpandedLog(expandedLog === `${log.timestamp}-${idx}` ? null : `${log.timestamp}-${idx}`)
                      }
                      className="w-full flex items-start gap-4 px-5 py-3.5 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`font-mono text-[11px] uppercase tracking-wider ${getActionColor(log.action)}`}
                          >
                            {log.action}
                          </Badge>
                          <span className="text-sm font-medium text-foreground truncate">
                            {log.details}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Fingerprint className="h-3 w-3" />
                            {log.userId.substring(0, 12)}...
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(log.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {log.ip}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(
                              `Action: ${log.action}\nUser: ${log.userId}\nDetails: ${log.details}\nTime: ${log.timestamp}\nIP: ${log.ip}`,
                              `${log.timestamp}-${idx}`
                            );
                          }}
                          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                        >
                          {copiedIndex === `${log.timestamp}-${idx}` ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                        {expandedLog === `${log.timestamp}-${idx}` ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {expandedLog === `${log.timestamp}-${idx}` && (
                      <div className="px-5 pb-4 pt-0">
                        <div className="ml-4 p-3 rounded-lg bg-muted/40 border border-muted-foreground/10 font-mono text-xs space-y-1">
                          <div>
                            <span className="text-muted-foreground">$ </span>
                            <span className="text-emerald-500">cat</span>{" "}
                            <span className="text-blue-500">/var/log/audit/{idx + 1}.json</span>
                          </div>
                          <div className="text-muted-foreground mt-2">{"{"}</div>
                          <div className="ml-4">
                            <span className="text-violet-500">"action"</span>:{" "}
                            <span className="text-amber-500">"{log.action}"</span>,
                          </div>
                          <div className="ml-4">
                            <span className="text-violet-500">"userId"</span>:{" "}
                            <span className="text-amber-500">"{log.userId}"</span>,
                          </div>
                          <div className="ml-4">
                            <span className="text-violet-500">"details"</span>:{" "}
                            <span className="text-amber-500">"{log.details}"</span>,
                          </div>
                          <div className="ml-4">
                            <span className="text-violet-500">"timestamp"</span>:{" "}
                            <span className="text-amber-500">"{log.timestamp}"</span>,
                          </div>
                          <div className="ml-4">
                            <span className="text-violet-500">"ip"</span>:{" "}
                            <span className="text-amber-500">"{log.ip}"</span>
                          </div>
                          <div className="text-muted-foreground">{"}"}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-muted-foreground/10">
                <p className="text-xs text-muted-foreground font-mono">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
