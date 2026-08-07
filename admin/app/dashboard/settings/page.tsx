"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Mail, CheckCircle, XCircle, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface AiSettings {
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl: string;
  aiSystemPrompt: string;
  aiTemperature: number;
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

export default function SettingsPage() {
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
    },
  });
  const [loading, setLoading] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showAiKey, setShowAiKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
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
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Site Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your website settings and preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            General Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Site Name
              </label>
              <Input
                value={settings.siteName}
                onChange={(e) => updateField("siteName", e.target.value)}
                placeholder="My Blog"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Site URL
              </label>
              <Input
                value={settings.siteUrl}
                onChange={(e) => updateField("siteUrl", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Admin Email
              </label>
              <Input
                value={settings.adminEmail}
                onChange={(e) => updateField("adminEmail", e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Site Description
            </label>
            <Textarea
              value={settings.siteDescription}
              onChange={(e) => updateField("siteDescription", e.target.value)}
              placeholder="A brief description of your website..."
              rows={3}
            />
          </div>
        </Card>

        {/* Branding */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Branding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Logo URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={settings.logoUrl}
                  onChange={(e) => updateField("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {settings.logoUrl && (
                <img src={settings.logoUrl} alt="Logo" className="h-12 mt-2 rounded" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Favicon URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={settings.faviconUrl}
                  onChange={(e) => updateField("faviconUrl", e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                />
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {settings.faviconUrl && (
                <img src={settings.faviconUrl} alt="Favicon" className="h-8 mt-2 rounded" />
              )}
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Social Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Twitter
              </label>
              <Input
                value={settings.socialLinks.twitter}
                onChange={(e) => updateSocialLink("twitter", e.target.value)}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                GitHub
              </label>
              <Input
                value={settings.socialLinks.github}
                onChange={(e) => updateSocialLink("github", e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                LinkedIn
              </label>
              <Input
                value={settings.socialLinks.linkedin}
                onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Instagram
              </label>
              <Input
                value={settings.socialLinks.instagram}
                onChange={(e) => updateSocialLink("instagram", e.target.value)}
                placeholder="https://instagram.com/username"
              />
            </div>
          </div>
        </Card>

        {/* Analytics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Analytics & Tracking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Google Analytics ID
              </label>
              <Input
                value={settings.analyticsId}
                onChange={(e) => updateField("analyticsId", e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Google Tag Manager ID
              </label>
              <Input
                value={settings.googleTagManagerId}
                onChange={(e) => updateField("googleTagManagerId", e.target.value)}
                placeholder="GTM-XXXXXXX"
              />
            </div>
          </div>
        </Card>

        {/* Email Configuration */}
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Email Configuration
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure SMTP settings for sending newsletters and emails
              </p>
            </div>
          </div>

          {/* Double Opt-in Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl mb-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SMTP Host
              </label>
              <Input
                value={settings.smtpHost}
                onChange={(e) => updateField("smtpHost", e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SMTP Port
              </label>
              <Input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => updateField("smtpPort", parseInt(e.target.value) || 587)}
                placeholder="587"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SMTP Username
              </label>
              <Input
                value={settings.smtpUsername}
                onChange={(e) => updateField("smtpUsername", e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SMTP Password
              </label>
              <Input
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => updateField("smtpPassword", e.target.value)}
                placeholder="Enter SMTP password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                From Email
              </label>
              <Input
                value={settings.smtpFromEmail}
                onChange={(e) => updateField("smtpFromEmail", e.target.value)}
                placeholder="newsletter@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                From Name
              </label>
              <Input
                value={settings.smtpFromName}
                onChange={(e) => updateField("smtpFromName", e.target.value)}
                placeholder="My Blog Newsletter"
              />
            </div>
          </div>

          {/* SSL Toggle */}
          <div className="flex items-center justify-between mt-4 p-3 bg-muted/20 rounded-lg">
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

        {/* AI Writer Configuration */}
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                AI Writer Configuration
              </h2>
              <p className="text-sm text-muted-foreground">
                Connect Gemini or any OpenAI-compatible provider to generate and refine articles
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Provider
              </label>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                API Key
              </label>
              <div className="flex gap-2">
                <Input
                  type={showAiKey ? "text" : "password"}
                  value={settings.ai.aiApiKey}
                  onChange={(e) => updateAiField("aiApiKey", e.target.value)}
                  placeholder="Paste your API key"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowAiKey(!showAiKey)}
                  title={showAiKey ? "Hide key" : "Show key"}
                >
                  {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Model
              </label>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Base URL <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                value={settings.ai.aiBaseUrl}
                onChange={(e) => updateAiField("aiBaseUrl", e.target.value)}
                placeholder="Auto-detected from provider"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Leave blank to use the provider default. Set only for self-hosted / custom endpoints.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Creativity (Temperature): {settings.ai.aiTemperature.toFixed(1)}
            </label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={settings.ai.aiTemperature}
              onChange={(e) => updateAiField("aiTemperature", parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Focused (0)</span>
              <span>Balanced (0.7)</span>
              <span>Creative (2)</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Default System Prompt
            </label>
            <Textarea
              value={settings.ai.aiSystemPrompt}
              onChange={(e) => updateAiField("aiSystemPrompt", e.target.value)}
              placeholder="Instructions the AI follows for every generation..."
              rows={4}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Controls how articles are structured. Reset to default if unsure.
            </p>
          </div>
        </Card>

        {/* Maintenance Mode */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Maintenance Mode
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enable maintenance mode to show a maintenance page to visitors
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => updateField("maintenanceMode", checked)}
            />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
