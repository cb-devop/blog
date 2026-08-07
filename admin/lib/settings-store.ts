import { setSmtpConfig } from "./email";

// In-memory settings store (shared across routes)
export interface AiSettings {
  // Provider: "gemini" | "openai" | "openrouter" | "custom"
  aiProvider: string;
  // API key for the chosen provider
  aiApiKey: string;
  // Model name (e.g. "gemini-2.0-flash", "gpt-4o", "anthropic/claude-3.5-sonnet")
  aiModel: string;
  // Base URL override (for custom / OpenAI-compatible endpoints).
  // When provider is "gemini", this is ignored (uses Google's OpenAI-compatible endpoint).
  aiBaseUrl: string;
  // Default system instructions prepended to every generation request
  aiSystemPrompt: string;
  // Creativity 0.0 - 2.0
  aiTemperature: number;
}

export interface SiteSettings {
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
  // Email / SMTP settings
  enableDoubleOptIn: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  smtpUseSSL: boolean;
  // AI settings
  ai: AiSettings;
}

export const defaultSettings: SiteSettings = {
  siteName: "PremiumBlog",
  siteDescription: "A premium blog and informational portal dedicated to sharing knowledge and insights with developers and makers.",
  siteUrl: "https://example.com",
  adminEmail: "admin@example.com",
  logoUrl: "",
  faviconUrl: "",
  maintenanceMode: false,
  socialLinks: { twitter: "", github: "", linkedin: "", instagram: "" },
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
    aiSystemPrompt:
      "You are an expert technical writer and blogger. Write clear, engaging, well-structured articles in HTML. Use <h2>/<h3> for sections, <p> for paragraphs, <ul>/<ol> for lists, <pre><code class=\"language-xxx\"> for code blocks, and <blockquote> for quotes. Never wrap output in a code fence. Output only the article HTML.",
    aiTemperature: 0.7,
  },
};

let siteSettings: SiteSettings = { ...defaultSettings };

export function getSettings(): SiteSettings {
  return { ...siteSettings, ai: { ...siteSettings.ai } };
}

export function getSafeSettings(): SiteSettings {
  return {
    ...siteSettings,
    smtpPassword: siteSettings.smtpPassword ? "********" : "",
    ai: {
      ...siteSettings.ai,
      aiApiKey: siteSettings.ai.aiApiKey ? "********" : "",
    },
  };
}

export function updateSettings(data: Partial<SiteSettings>): SiteSettings {
  siteSettings = {
    ...siteSettings,
    ...data,
    ai: { ...siteSettings.ai, ...(data.ai || {}) },
  };
  syncSmtpConfig();
  return getSettings();
}

export function isSmtpConfigured(): boolean {
  return !!(siteSettings.smtpHost && siteSettings.smtpUsername && siteSettings.smtpPassword);
}

export function isAiConfigured(): boolean {
  return !!(siteSettings.ai.aiApiKey && siteSettings.ai.aiModel);
}

export function getAiSettings(): AiSettings {
  return { ...siteSettings.ai };
}

function syncSmtpConfig() {
  if (siteSettings.smtpHost && siteSettings.smtpUsername && siteSettings.smtpPassword) {
    setSmtpConfig({
      host: siteSettings.smtpHost,
      port: siteSettings.smtpPort || 587,
      username: siteSettings.smtpUsername,
      password: siteSettings.smtpPassword,
      fromEmail: siteSettings.smtpFromEmail || siteSettings.adminEmail,
      fromName: siteSettings.smtpFromName || siteSettings.siteName,
      useSSL: siteSettings.smtpUseSSL || false,
    });
  }
}

// Initial sync
syncSmtpConfig();
