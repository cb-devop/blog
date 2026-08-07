import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { getSecuritySettings } from "./security-settings";

// Role-based access check
export function checkRole(
  request: Request,
  allowedRoles: string[] = ["ADMIN", "EDITOR"]
): { userId: string; role: string } | null {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId || !role) {
    return null;
  }

  if (!allowedRoles.includes(role)) {
    return null;
  }

  return { userId, role };
}

// Require admin-only access
export function requireAdmin(request: Request) {
  return checkRole(request, ["ADMIN"]);
}

// Generic auth check (any authenticated user)
export function requireAuth(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return null;
  }
  return { userId };
}

// Validation helpers
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const clean = email.toLowerCase().trim();
  return clean.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

export function validateString(value: string, maxLength: number = 500): string {
  if (!value || typeof value !== "string") return "";
  return value.trim().replace(/<[^>]*>/g, "").substring(0, maxLength);
}

// HTML allowed in rich content (TipTap editor output)
const ALLOWED_TAGS = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "em", "s", "u", "mark", "sub", "sup", "span",
  "code", "pre", "blockquote",
  "ul", "ol", "li", "br", "hr",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "figure", "figcaption", "div",
];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    code: ["class"],
    pre: ["class"],
    th: ["align", "colspan", "rowspan"],
    td: ["align", "colspan", "rowspan"],
    "*": ["class"],
  },
  // Only safe URL schemes — blocks javascript:, data: (except images), vbscript: etc.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
  },
  allowedSchemesAppliedToAttributes: ["href", "src"],
  disallowedTagsMode: "discard",
  allowVulnerableTags: false,
  transformTags: {
    // Prevent reverse-tabnabbing: always add rel="noopener noreferrer" to links
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: Array.from(
          new Set([...(attribs.rel ? attribs.rel.split(/\s+/) : []), "noopener", "noreferrer"])
        ).join(" "),
      },
    }),
  },
};

// Sanitize HTML with the same rules used before persisting.
// Use this before rendering HTML to the client (e.g. AI previews).
export function sanitizeArticleHtml(value: string): string {
  if (!value || typeof value !== "string") return "";
  return sanitizeHtml(value, SANITIZE_OPTIONS).trim();
}

// For rich HTML content like blog post body - proper HTML sanitizer (XSS prevention)
// Blocks script/iframe/object/embed/style, javascript: URLs, event handlers, etc.
// while preserving the structural HTML produced by the TipTap editor.
export function validateHtmlContent(value: string, maxLength: number = 100000): string {
  if (!value || typeof value !== "string") return "";
  return sanitizeArticleHtml(value).substring(0, maxLength);
}

export function validateSlug(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function validateUrl(value: string): boolean {
  if (!value) return true; // optional
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// Error response helper (prevents info leakage)
export function apiError(message: string, status: number = 400) {
  const publicMessages: Record<number, string> = {
    400: "Invalid request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    409: "Conflict",
    429: "Too many requests",
    500: "Internal server error",
  };

  return NextResponse.json(
    { error: publicMessages[status] || message },
    { status }
  );
}

// Simple in-memory audit log (in production, use a database table)
const auditLog: Array<{
  action: string;
  userId: string;
  details: string;
  timestamp: Date;
  ip: string;
}> = [];

// Add startup entry (guard against duplicate entries with HMR)
let _startupLogged = false;
if (!_startupLogged) {
  _startupLogged = true;
  try {
    const settings = getSecuritySettings();
    if (settings.auditLogEnabled) {
      auditLog.push({
        action: "system.start",
        userId: "system",
        details: "Server started - audit logging initialized",
        timestamp: new Date(),
        ip: "127.0.0.1",
      });
    }
  } catch {
    // Module may not be fully initialized yet
  }
}

export function logAudit(
  action: string,
  userId: string,
  details: string,
  request?: Request
) {
  const settings = getSecuritySettings();

  // Skip logging if audit log is disabled
  if (!settings.auditLogEnabled) {
    console.log(`[AUDIT] ${action} by ${userId}: ${details}`);
    return;
  }

  const ip =
    request?.headers.get("x-forwarded-for") ||
    request?.headers.get("x-real-ip") ||
    "unknown";

  auditLog.push({
    action,
    userId,
    details,
    timestamp: new Date(),
    ip,
  });

  // Keep only last N entries (configurable via security settings)
  if (auditLog.length > settings.auditLogMaxEntries) {
    auditLog.splice(0, auditLog.length - settings.auditLogMaxEntries);
  }

  console.log(`[AUDIT] ${action} by ${userId}: ${details}`);
}

export function getAuditLog() {
  const settings = getSecuritySettings();
  if (!settings.auditLogEnabled) {
    return [];
  }
  return [...auditLog].reverse();
}
