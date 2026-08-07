import { NextResponse } from "next/server";
import { requireAuth, apiError, logAudit, validateString } from "@/lib/security";
import { verifySmtpConnection } from "@/lib/email";
import { getSettings, getSafeSettings, updateSettings, isSmtpConfigured } from "@/lib/settings-store";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

async function propagateMaintenanceMode(enable: boolean) {
  try {
    await fetch(`${FRONTEND_URL}/api/maintenance-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maintenanceMode: enable }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.warn("Failed to propagate maintenance mode to frontend:", err);
  }
}

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);
    return NextResponse.json(getSafeSettings());
  } catch (error) {
    console.error("Error fetching settings:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const data = await request.json();
    const current = getSettings();
    const siteName = validateString(data.siteName, 100);
    if (!siteName) return apiError("Site name is required", 400);

    const prevMaintenance = current.maintenanceMode;
    const newMaintenance = data.maintenanceMode ?? current.maintenanceMode;

    // Build new SMTP password – only update if a new value is provided (not masked)
    const smtpPassword =
      data.smtpPassword && data.smtpPassword !== "********"
        ? data.smtpPassword
        : current.smtpPassword;

    // Build new AI API key – only update if a new value is provided (not masked)
    const aiApiKey =
      data.ai?.aiApiKey && data.ai.aiApiKey !== "********"
        ? data.ai.aiApiKey
        : current.ai.aiApiKey;

    updateSettings({
      siteName,
      siteDescription: validateString(data.siteDescription ?? current.siteDescription, 500) || current.siteDescription,
      siteUrl: data.siteUrl || current.siteUrl,
      adminEmail: data.adminEmail || current.adminEmail,
      logoUrl: data.logoUrl ?? current.logoUrl,
      faviconUrl: data.faviconUrl ?? current.faviconUrl,
      maintenanceMode: newMaintenance,
      socialLinks: {
        twitter: data.socialLinks?.twitter ?? current.socialLinks.twitter,
        github: data.socialLinks?.github ?? current.socialLinks.github,
        linkedin: data.socialLinks?.linkedin ?? current.socialLinks.linkedin,
        instagram: data.socialLinks?.instagram ?? current.socialLinks.instagram,
      },
      analyticsId: data.analyticsId ?? current.analyticsId,
      googleTagManagerId: data.googleTagManagerId ?? current.googleTagManagerId,
      enableDoubleOptIn: data.enableDoubleOptIn ?? current.enableDoubleOptIn,
      smtpHost: data.smtpHost ?? current.smtpHost,
      smtpPort: data.smtpPort ?? current.smtpPort,
      smtpUsername: data.smtpUsername ?? current.smtpUsername,
      smtpPassword,
      smtpFromEmail: data.smtpFromEmail ?? current.smtpFromEmail,
      smtpFromName: data.smtpFromName ?? current.smtpFromName,
      smtpUseSSL: data.smtpUseSSL ?? current.smtpUseSSL,
      ai: {
        aiProvider: data.ai?.aiProvider ?? current.ai.aiProvider,
        aiApiKey,
        aiModel: data.ai?.aiModel ?? current.ai.aiModel,
        aiBaseUrl: data.ai?.aiBaseUrl ?? current.ai.aiBaseUrl,
        aiSystemPrompt: data.ai?.aiSystemPrompt ?? current.ai.aiSystemPrompt,
        aiTemperature: data.ai?.aiTemperature ?? current.ai.aiTemperature,
      },
    });

    // Propagate maintenance mode changes to the frontend
    if (prevMaintenance !== newMaintenance) {
      await propagateMaintenanceMode(newMaintenance);
    }

    logAudit("settings.update", auth.userId, "Updated site settings", request);

    // Test SMTP connection if configured
    let smtpTestResult = null;
    if (isSmtpConfigured()) {
      smtpTestResult = await verifySmtpConnection();
    }

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: getSafeSettings(),
      smtpTestResult,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return apiError("Internal server error", 500);
  }
}
