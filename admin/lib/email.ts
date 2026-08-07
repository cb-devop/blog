import nodemailer from "nodemailer";

interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  useSSL: boolean;
}

let currentSmtpConfig: SmtpConfig | null = null;

export function setSmtpConfig(config: SmtpConfig) {
  currentSmtpConfig = config;
}

export function getSmtpConfig(): SmtpConfig | null {
  return currentSmtpConfig ? { ...currentSmtpConfig } : null;
}

function createTransporter() {
  if (!currentSmtpConfig) {
    throw new Error("SMTP not configured. Please configure email settings first.");
  }

  return nodemailer.createTransport({
    host: currentSmtpConfig.host,
    port: currentSmtpConfig.port,
    secure: currentSmtpConfig.useSSL,
    auth: {
      user: currentSmtpConfig.username,
      pass: currentSmtpConfig.password,
    },
  });
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    if (!currentSmtpConfig) {
      console.warn("SMTP not configured. Email not sent.");
      return false;
    }

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${currentSmtpConfig.fromName}" <${currentSmtpConfig.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function verifySmtpConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!currentSmtpConfig) {
      return { success: false, error: "SMTP not configured" };
    }

    const transporter = createTransporter();
    await transporter.verify();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to verify SMTP connection" };
  }
}

export function generateVerificationToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function buildVerificationEmailHtml(siteName: string, verifyUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a2e;">Confirm Your Subscription</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #71717a; line-height: 1.5;">
                You're almost there! Click the button below to confirm your subscription to <strong>${siteName}</strong>.
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding: 24px 40px;">
              <hr style="border: none; border-top: 1px solid #e4e4e7;" />
            </td>
          </tr>
          <!-- Button -->
          <tr>
            <td style="padding: 0 40px 8px; text-align: center;">
              <a href="${verifyUrl}" style="display: inline-block; padding: 14px 36px; background-color: #1a1a2e; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; letter-spacing: 0.3px;">
                Confirm Subscription
              </a>
            </td>
          </tr>
          <!-- Fallback link -->
          <tr>
            <td style="padding: 16px 40px 0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 4px 0 0; font-size: 11px; color: #71717a; word-break: break-all; font-family: monospace;">
                ${verifyUrl}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
                If you didn't request this subscription, you can safely ignore this email.<br />
                No changes have been made to your account.
              </p>
            </td>
          </tr>
        </table>
        <!-- Footer outside card -->
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">
          <tr>
            <td style="padding: 16px 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                &copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildWelcomeEmailHtml(siteName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1a1a2e;">Welcome to ${siteName}!</h1>
              <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
                You've successfully confirmed your subscription. You'll now receive the latest articles, insights, and updates directly in your inbox.
              </p>
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
              <p style="margin: 0; font-size: 13px; color: #a1a1aa;">
                Stay tuned for great content!
              </p>
            </td>
          </tr>
        </table>
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">
          <tr>
            <td style="padding: 16px 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                &copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildContactNotificationHtml(
  siteName: string,
  data: { name: string; email: string; subject?: string | null; message: string; messageUrl: string }
): string {
  const subjectLine = data.subject ? data.subject : "(No subject)";
  const preview = data.message.replace(/<[^>]*>/g, "").slice(0, 200);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 0; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6366f1; font-weight: 700;">New Contact Message</p>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #1a1a2e;">${escapeHtml(subjectLine)}</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #71717a; line-height: 1.5;">
                Someone just reached out via the contact form on <strong>${siteName}</strong>.
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding: 24px 40px;">
              <hr style="border: none; border-top: 1px solid #e4e4e7;" />
            </td>
          </tr>
          <!-- Sender details -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                <tr>
                  <td style="padding: 4px 0; color: #71717a; width: 80px; vertical-align: top;">From</td>
                  <td style="padding: 4px 0; color: #1a1a2e; font-weight: 600;">${escapeHtml(data.name)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #71717a; vertical-align: top;">Email</td>
                  <td style="padding: 4px 0; color: #1a1a2e;"><a href="mailto:${escapeHtml(data.email)}" style="color: #6366f1; text-decoration: none;">${escapeHtml(data.email)}</a></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #71717a; vertical-align: top;">Subject</td>
                  <td style="padding: 4px 0; color: #1a1a2e;">${escapeHtml(subjectLine)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Message preview -->
          <tr>
            <td style="padding: 20px 40px 0;">
              <div style="background-color: #f4f4f5; border-radius: 10px; padding: 16px 20px; font-size: 14px; color: #3f3f46; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(preview)}</div>
            </td>
          </tr>
          <!-- Button -->
          <tr>
            <td style="padding: 24px 40px 8px; text-align: center;">
              <a href="${escapeHtml(data.messageUrl)}" style="display: inline-block; padding: 13px 32px; background-color: #1a1a2e; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; letter-spacing: 0.3px;">
                View &amp; Reply in Admin
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
                You received this because you're the admin of ${siteName}.<br />
                Log in to your dashboard to read the full message and reply directly.
              </p>
            </td>
          </tr>
        </table>
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">
          <tr>
            <td style="padding: 16px 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                &copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

