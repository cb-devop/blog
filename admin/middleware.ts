import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getSecuritySettings } from "@/lib/security-settings";

const JWT_SECRET_ENV = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";

// Warn about default JWT secret in production
if (JWT_SECRET_ENV === "dev-jwt-secret-change-in-production" && process.env.NODE_ENV === "production") {
  console.warn(
    "\x1b[33m⚠️  WARNING: Using default JWT_SECRET in production!\x1b[0m\n" +
    "\x1b[33m   Set a strong JWT_SECRET environment variable immediately.\x1b[0m"
  );
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_ENV);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as {
      userId: string;
      email: string;
      role: string;
      name?: string;
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS headers for cross-origin requests (frontend → admin API)
  const origin = request.headers.get("origin") || "";
  const allowedOrigins = [
    "http://localhost:3000",
    process.env.FRONTEND_URL || "",
  ].filter(Boolean);
  const corsOrigin = allowedOrigins.includes(origin) ? origin : "*";

  // Common CORS headers helper
  function addCorsHeaders(resp: NextResponse): NextResponse {
    resp.headers.set("Access-Control-Allow-Origin", corsOrigin);
    resp.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    resp.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    if (corsOrigin !== "*") {
      resp.headers.set("Access-Control-Allow-Credentials", "true");
    }
    resp.headers.set("Vary", "Origin");

    // Apply security headers from settings
    try {
      const secSettings = getSecuritySettings();
      if (secSettings.enableHSTS) {
        resp.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
      }
      if (secSettings.enableXFrameOptions) {
        resp.headers.set("X-Frame-Options", "DENY");
      }
      if (secSettings.enableXSSProtection) {
        resp.headers.set("X-XSS-Protection", "1; mode=block");
        resp.headers.set("X-Content-Type-Options", "nosniff");
      }
      if (secSettings.enableCSP) {
        resp.headers.set(
          "Content-Security-Policy",
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'"
        );
      }
    } catch {
      // Security settings module may not be initialized
    }

    return resp;
  }

  // Handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    return addCorsHeaders(new NextResponse(null, {
      headers: {
        "Access-Control-Max-Age": "86400",
      },
    }));
  }

  // Public routes - allow through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/signup") ||
    pathname.startsWith("/api/posts/public") ||
    pathname.startsWith("/api/subscribers/verify") ||
    (pathname.startsWith("/api/subscribers") && request.method === "POST") ||
    (pathname.startsWith("/api/contact") && request.method === "POST") ||
    (pathname.match(/^\/api\/posts\/[^\/]+\/comments$/) && (request.method === "GET" || request.method === "POST")) ||
    (pathname.match(/^\/api\/posts\/by-slug\/[^\/]+$/) && request.method === "GET") ||
    pathname === "/auth/login"
  ) {
    return addCorsHeaders(NextResponse.next());
  }

  // Protect dashboard and API routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const userData = await verifyToken(token);
    if (!userData) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Set user ID header for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(userData.userId));
    requestHeaders.set("x-user-role", userData.role || "EDITOR");
    if (userData.email) {
      requestHeaders.set("x-user-email", userData.email);
    }

    return addCorsHeaders(NextResponse.next({
      request: { headers: requestHeaders },
    }));
  }

  return addCorsHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
