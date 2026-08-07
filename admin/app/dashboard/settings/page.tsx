"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Upload,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Palette,
  Share2,
  BarChart3,
  Globe,
  AtSign,
  KeyRound,
  Server,
  Info,
  BadgeCheck,
  AlertTriangle,
  Image,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface AiSettings {
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl: string;
  aiSystemPrompt: string;
  aiTemperature: number;
  aiApiKeyFromEnv?: boolean;
}

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  logoUrl: string;
  faviconUrl: string;
  maintenanceMode: boolean;
  socialLinks: {
    twitter: string;
    github: string;
    linkedin: string;
    instagram: string;
  };
  analyticsId: string;
  googleTagManagerId: string;
  enableDoubleOptIn: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  smtpUseSSL: boolean;
  ai: AiSettings;
}

const AI_PROVIDERS = [
  { id: "gemini", label: "Google Gemini (OpenAI-compatible)" },
  { id: "openai", label: "OpenAI" },
  { id: "openrouter", label: "OpenRouter (multi-model)" },
  { id: "groq", label: "Groq" },
  { id: "mistral", label: "Mistral" },
  { id: "custom", label: "Custom (OpenAI-compatible endpoint)" },
];

const MODEL_SUGGESTIONS: Record<string, string[]> = {
  gemini: ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "o3-mini"],
  openrouter: ["google/gemini-2.0-flash-exp:free", "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.3-70b-instruct"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
  mistral: ["mistral-large-latest", "mistral-small-latest"],
  custom: [],
};

const TABS = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "social", label: "Social Links", icon: Share2 },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "email", label: "Email & SMTP", icon: Mail },
  { id: "ai", label: "AI Writer", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: { label: string; state: "ok" | "warn" | "off" };
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {badge && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                badge.state === "ok" && "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
                badge.state === "warn" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                badge.state === "off" && "bg-muted text-muted-foreground border border-border"
              )}
            >
              {badge.state === "ok" ? (
                <BadgeCheck className="h-3 w-3" />
              ) : badge.state === "warn" ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <Info className="h-3 w-3" />
              )}
              {badge.label}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// Field wrapper: consistent label + optional hint + children
function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
        {label}
        {optional && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-muted text-muted-foreground">
            Optional
          </span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
    </div>
  );
}

// Input with a leading icon
function IconInput({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ElementType }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input {...props} className={cn("pl-9", props.className)} />
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "",
    siteDescription: "",
    siteUrl: "",
    adminEmail: "",
    logoUrl: "",
    faviconUrl: "",
    maintenanceMode: false,
    socialLinks: {
      twitter: "",
      github: "",
      linkedin: "",
      instagram: "",
    },
    analyticsId: "",
    googleTagManagerId: "",
    enableDoubleOptIn: true,
    smtpHost: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    smtpFromEmail: "",
    smtpFromName: "",
    smtpUseSSL: false,
    ai: {
      aiProvider: "gemini",
      aiApiKey: "",
      aiModel: "gemini-2.0-flash",
      aiBaseUrl: "",
      aiSystemPrompt: "",
      aiTemperature: 0.7,
      aiApiKeyFromEnv: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showAiKey, setShowAiKey] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const dirty = savedSnapshot !== "" && JSON.stringify(settings) !== savedSnapshot;

  const fetchSettings = async () => {
    setLoadError(null);
    setLoaded(false);
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setSavedSnapshot(JSON.stringify(data));
        setLoaded(true);
      } else {
        setLoadError(`Failed to load settings (${response.status})`);
        // Don't block saving forever — user can still save with current values
        setLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setLoadError("Network error — could not load settings");
      setLoaded(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.smtpTestResult) {
          if (data.smtpTestResult.success) {
            setSmtpStatus({ success: true, message: "SMTP connection verified successfully!" });
          } else {
            setSmtpStatus({ success: false, message: `SMTP connection failed: ${data.smtpTestResult.error || "Unknown error"}` });
          }
        }
        setSavedSnapshot(JSON.stringify(settings));
        toast({
          title: "Success",
          description: "Settings updated successfully!",
        });
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof SiteSettings, value: any) => {
    setSmtpStatus(null);
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const updateAiField = (field: keyof AiSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      ai: { ...prev.ai, [field]: value },
    }));
  };

  const updateSocialLink = (platform: keyof typeof settings.socialLinks, value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const testSmtpConnection = async () => {
    setSmtpTesting(true);
    setSmtpStatus(null);
    try {
      const response = await fetch("/api/settings/test-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: settings.smtpHost,
          port: settings.smtpPort,
          username: settings.smtpUsername,
          password: settings.smtpPassword,
          fromEmail: settings.smtpFromEmail || settings.adminEmail,
          fromName: settings.smtpFromName || settings.siteName,
          useSSL: settings.smtpUseSSL,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSmtpStatus({ success: true, message: "SMTP connection successful!" });
      } else {
        setSmtpStatus({ success: false, message: data.error || "Connection failed" });
      }
    } catch (err) {
      setSmtpStatus({ success: false, message: "Failed to test connection" });
    } finally {
      setSmtpTesting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
            <p className="text-muted-foreground mt-0.5">
              Configure your website settings and preferences
            </p>
          </div>
        </div>
        {loaded && !loadError && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
            {dirty ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </>
            ) : (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                Saved
              </>
            )}
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="sticky top-0 z-10 -mx-1 overflow-x-auto pb-2">
        <div role="tablist" aria-label="Settings sections" className="flex min-w-max gap-1 rounded-xl border bg-card p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className={cn("h-4 w-4 transition-colors", activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form id="settings-form" onSubmit={handleSubmit} className="flex flex-1 flex-col space-y-6">
        {/* ============ GENERAL ============ */}
        {activeTab === "general" && (
          <>
            <Card className="p-6">
              <SectionHeader icon={SettingsIcon} title="General Settings" subtitle="Basic information about your site" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Site Name" hint="Shown in the browser tab and site header">
                  <IconInput
                    icon={Globe}
                    value={settings.siteName}
                    onChange={(e) => updateField("siteName", e.target.value)}
                    placeholder="My Blog"
                  />
                </Field>
                <Field label="Site URL" hint="Your public website address">
                  <IconInput
                    icon={Globe}
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => updateField("siteUrl", e.target.value)}
                    placeholder="https://example.com"
                  />
                </Field>
                <Field label="Admin Email" hint="Where contact form messages are sent">
                  <IconInput
                    icon={Mail}
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => updateField("adminEmail", e.target.value)}
                    placeholder="admin@example.com"
                  />
                </Field>
                <Field label="Site Description" optional hint="Short summary used for SEO & about sections">
                  <Textarea
                    value={settings.siteDescription}
                    onChange={(e) => updateField("siteDescription", e.target.value)}
                    placeholder="A brief description of your website..."
                    rows={3}
                  />
                </Field>
              </div>
            </Card>

            <Card className="p-6 overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-colors",
                    settings.maintenanceMode ? "bg-amber-500/15" : "bg-muted"
                  )}>
                    <AlertTriangle className={cn("h-5 w-5", settings.maintenanceMode ? "text-amber-500" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-foreground">Maintenance Mode</h2>
                      {settings.maintenanceMode && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {settings.maintenanceMode
                        ? "Visitors are currently seeing the maintenance page."
                        : "Enable to show a maintenance page to visitors while you work."}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateField("maintenanceMode", checked)}
                />
              </div>
            </Card>

          </>
        )}

        {/* ============ BRANDING ============ */}
        {activeTab === "branding" && (
          <Card className="p-6">
            <SectionHeader icon={Palette} title="Branding" subtitle="Logo and favicon shown across your site" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Logo URL" hint="Main brand logo — shown in the site header">
                <div className="flex gap-2">
                  <IconInput
                    icon={Image}
                    value={settings.logoUrl}
                    onChange={(e) => updateField("logoUrl", e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" type="button" title="Upload logo">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {settings.logoUrl ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.logoUrl} alt="Logo preview" className="h-10 max-w-[140px] object-contain rounded" />
                    <span className="text-[10px] text-muted-foreground font-mono">logo preview</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground/70 mt-2">No logo set — site name will be shown instead.</p>
                )}
              </Field>
              <Field label="Favicon URL" hint="Small icon shown in the browser tab">
                <div className="flex gap-2">
                  <IconInput
                    icon={Image}
                    value={settings.faviconUrl}
                    onChange={(e) => updateField("faviconUrl", e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" type="button" title="Upload favicon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {settings.faviconUrl ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.faviconUrl} alt="Favicon preview" className="h-8 w-8 object-contain rounded" />
                    <span className="text-[10px] text-muted-foreground font-mono">favicon preview</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground/70 mt-2">No favicon set.</p>
                )}
              </Field>
            </div>
          </Card>
        )}

        {/* ============ SOCIAL LINKS ============ */}
        {activeTab === "social" && (
          <Card className="p-6">
            <SectionHeader icon={Share2} title="Social Links" subtitle="Links displayed in your site footer and about page" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Twitter / X" hint="Your Twitter profile URL">
                <IconInput
                  icon={AtSign}
                  value={settings.socialLinks.twitter}
                  onChange={(e) => updateSocialLink("twitter", e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </Field>
              <Field label="GitHub" hint="Your GitHub profile URL">
                <IconInput
                  icon={Globe}
                  value={settings.socialLinks.github}
                  onChange={(e) => updateSocialLink("github", e.target.value)}
                  placeholder="https://github.com/username"
                />
              </Field>
              <Field label="LinkedIn" hint="Your LinkedIn profile URL">
                <IconInput
                  icon={Globe}
                  value={settings.socialLinks.linkedin}
                  onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </Field>
              <Field label="Instagram" hint="Your Instagram profile URL">
                <IconInput
                  icon={Hash}
                  value={settings.socialLinks.instagram}
                  onChange={(e) => updateSocialLink("instagram", e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </Field>
            </div>
          </Card>
        )}

        {/* ============ ANALYTICS ============ */}
        {activeTab === "analytics" && (
          <Card className="p-6">
            <SectionHeader icon={BarChart3} title="Analytics & Tracking" subtitle="Google Analytics and Tag Manager integration" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Google Analytics ID" hint="Format: G-XXXXXXXXXX (GA4 measurement ID)">
                <IconInput
                  icon={BarChart3}
                  value={settings.analyticsId}
                  onChange={(e) => updateField("analyticsId", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </Field>
              <Field label="Google Tag Manager ID" hint="Format: GTM-XXXXXXX (container ID)">
                <IconInput
                  icon={BarChart3}
                  value={settings.googleTagManagerId}
                  onChange={(e) => updateField("googleTagManagerId", e.target.value)}
                  placeholder="GTM-XXXXXXX"
                />
              </Field>
            </div>
          </Card>
        )}

        {/* ============ EMAIL & SMTP ============ */}
        {activeTab === "email" && (
          <Card className="p-6">
            <SectionHeader
              icon={Mail}
              title="Email Configuration"
              subtitle="Configure SMTP settings for sending newsletters and emails"
              badge={
                settings.smtpHost && settings.smtpUsername && settings.smtpPassword
                  ? { label: "Configured", state: "ok" }
                  : { label: "Not configured", state: "warn" }
              }
            />

            {/* Double Opt-in Toggle */}
            <div className="flex items-start justify-between gap-4 p-4 bg-muted/40 rounded-xl mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Double Opt-in Verification</h3>
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary rounded-full">Recommended</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Send a confirmation email when users subscribe. They must click the link to verify their email address.
                </p>
              </div>
              <Switch
                checked={settings.enableDoubleOptIn}
                onCheckedChange={(checked) => updateField("enableDoubleOptIn", checked)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="SMTP Host" hint="e.g. smtp.gmail.com, smtp.zoho.com">
                <IconInput
                  icon={Server}
                  value={settings.smtpHost}
                  onChange={(e) => updateField("smtpHost", e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </Field>
              <Field label="SMTP Port" hint="587 (STARTTLS) or 465 (SSL)">
                <IconInput
                  icon={Server}
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => updateField("smtpPort", parseInt(e.target.value) || 587)}
                  placeholder="587"
                />
              </Field>
              <Field label="SMTP Username" hint="Usually your full email address">
                <IconInput
                  icon={Mail}
                  value={settings.smtpUsername}
                  onChange={(e) => updateField("smtpUsername", e.target.value)}
                  placeholder="your@email.com"
                />
              </Field>
              <Field label="SMTP Password" hint="App passwords work best for Gmail">
                <IconInput
                  icon={KeyRound}
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => updateField("smtpPassword", e.target.value)}
                  placeholder="Enter SMTP password"
                />
              </Field>
              <Field label="From Email" optional hint="Defaults to the admin email">
                <IconInput
                  icon={Mail}
                  type="email"
                  value={settings.smtpFromEmail}
                  onChange={(e) => updateField("smtpFromEmail", e.target.value)}
                  placeholder="newsletter@example.com"
                />
              </Field>
              <Field label="From Name" optional hint="Name shown as the sender">
                <IconInput
                  icon={Mail}
                  value={settings.smtpFromName}
                  onChange={(e) => updateField("smtpFromName", e.target.value)}
                  placeholder="My Blog Newsletter"
                />
              </Field>
            </div>

            {/* SSL Toggle */}
            <div className="flex items-center justify-between mt-6 p-3 bg-muted/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Use SSL/TLS</p>
                <p className="text-xs text-muted-foreground">Enable for port 465 (SSL) or keep disabled for STARTTLS on port 587</p>
              </div>
              <Switch
                checked={settings.smtpUseSSL}
                onCheckedChange={(checked) => updateField("smtpUseSSL", checked)}
              />
            </div>

            {/* SMTP Status & Test */}
            {smtpStatus && (
              <div className={`flex items-center gap-2 mt-4 p-3 rounded-lg text-sm ${
                smtpStatus.success
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              }`}>
                {smtpStatus.success ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span>{smtpStatus.message}</span>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={testSmtpConnection}
                disabled={smtpTesting || !settings.smtpHost || !settings.smtpUsername}
                className="flex items-center gap-2"
              >
                {smtpTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {smtpTesting ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </Card>
        )}

        {/* ============ AI WRITER ============ */}
        {activeTab === "ai" && (
          <Card className="p-6">
            <SectionHeader
              icon={Sparkles}
              title="AI Writer Configuration"
              subtitle="Connect Gemini or any OpenAI-compatible provider to generate and refine articles"
              badge={
                settings.ai.aiApiKey && settings.ai.aiModel
                  ? { label: "Connected", state: "ok" }
                  : { label: "Not configured", state: "warn" }
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Provider" hint="Which AI service powers the writer">
                <select
                  value={settings.ai.aiProvider}
                  onChange={(e) =>
                    updateAiField("aiProvider", e.target.value)
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {AI_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="API Key"
                hint={
                  settings.ai.aiApiKeyFromEnv
                    ? "Managed by the AI_API_KEY / GEMINI_API_KEY environment variable. Edit it on the server and restart to change."
                    : "Stored safely, never shown again after saving"
                }
              >
                <div className="flex gap-2">
                  <IconInput
                    icon={KeyRound}
                    type={showAiKey ? "text" : "password"}
                    value={settings.ai.aiApiKey}
                    onChange={(e) => updateAiField("aiApiKey", e.target.value)}
                    placeholder="Paste your API key"
                    className="flex-1"
                    disabled={settings.ai.aiApiKeyFromEnv}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAiKey(!showAiKey)}
                    title={showAiKey ? "Hide key" : "Show key"}
                    disabled={settings.ai.aiApiKeyFromEnv}
                  >
                    {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </Field>
              <Field label="Model" hint="Model suggestions update per provider">
                <Input
                  value={settings.ai.aiModel}
                  onChange={(e) => updateAiField("aiModel", e.target.value)}
                  placeholder="e.g. gemini-2.0-flash"
                />
                {MODEL_SUGGESTIONS[settings.ai.aiProvider]?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {MODEL_SUGGESTIONS[settings.ai.aiProvider].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => updateAiField("aiModel", m)}
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </Field>
              <Field label="Base URL" optional hint="Leave blank to use the provider default. Only for custom endpoints.">
                <Input
                  value={settings.ai.aiBaseUrl}
                  onChange={(e) => updateAiField("aiBaseUrl", e.target.value)}
                  placeholder="Auto-detected from provider"
                />
              </Field>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">
                  Creativity (Temperature)
                </label>
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-semibold">
                  {settings.ai.aiTemperature.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={settings.ai.aiTemperature}
                onChange={(e) => updateAiField("aiTemperature", parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>Focused (0)</span>
                <span>Balanced (0.7)</span>
                <span>Creative (2)</span>
              </div>
            </div>

            <div className="mt-6">
              <Field label="Default System Prompt" hint="Controls how articles are structured. Reset to default if unsure.">
                <Textarea
                  value={settings.ai.aiSystemPrompt}
                  onChange={(e) => updateAiField("aiSystemPrompt", e.target.value)}
                  placeholder="Instructions the AI follows for every generation..."
                  rows={4}
                />
              </Field>
            </div>
          </Card>
        )}

        {/* Sticky Save Bar — pinned to the bottom of the scroll area */}
        <div className="sticky bottom-0 z-10 mt-auto -mx-4 lg:-mx-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t bg-card/95 backdrop-blur px-5 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.15)]">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {loadError ? (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">{loadError}</span>
                <button
                  type="button"
                  onClick={fetchSettings}
                  className="ml-1 rounded-md border px-2 py-0.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  Retry
                </button>
              </>
            ) : !loaded ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading settings...</span>
              </>
            ) : dirty ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-medium text-amber-500">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">All changes saved</span>
              </>
            )}
          </div>
          <Button type="submit" form="settings-form" disabled={loading || (!loaded && !loadError)} className="flex items-center gap-2 w-full sm:w-auto">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
