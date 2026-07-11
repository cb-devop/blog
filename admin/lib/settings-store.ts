import { setSmtpConfig } from "./email";

// In-memory settings store (shared across routes)
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
};

let siteSettings: SiteSettings = { ...defaultSettings };

export function getSettings(): SiteSettings {
  return { ...siteSettings };
}

export function getSafeSettings(): SiteSettings {
  return {
    ...siteSettings,
    smtpPassword: siteSettings.smtpPassword ? "********" : "",
  };
}

export function updateSettings(data: Partial<SiteSettings>): SiteSettings {
  siteSettings = {
    ...siteSettings,
    ...data,
  };
  syncSmtpConfig();
  return { ...siteSettings };
}

export function isSmtpConfigured(): boolean {
  return !!(siteSettings.smtpHost && siteSettings.smtpUsername && siteSettings.smtpPassword);
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
