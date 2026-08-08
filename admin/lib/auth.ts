import { jwtVerify, SignJWT } from "jose";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set.");
}
const JWT_SECRET = new TextEncoder().encode(secret);

export async function verifyAuth(token: string | undefined | null) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const data = payload as unknown as {
      userId: string;
      email: string;
      role: string;
      name?: string;
    };

    return {
      id: data.userId,
      name: data.name || data.email?.split("@")[0] || "Admin User",
      email: data.email,
      role: data.role || "EDITOR",
    };
  } catch {
    return null;
  }
}

// Extract admin_token from cookie string
export function getTokenFromCookie(cookieString: string | null | undefined): string | null {
  if (!cookieString) return null;

  const cookies = cookieString.split(";").reduce(
    (acc, cookie) => {
      const [key, ...val] = cookie.trim().split("=");
      acc[key] = val.join("=");
      return acc;
    },
    {} as Record<string, string>
  );

  return cookies["admin_token"] || cookies["token"] || null;
}

export function signToken(payload: { userId: string; email: string; role: string; name?: string | null }, expiresInHours: number = 24) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${expiresInHours}h`)
    .sign(JWT_SECRET);
}

// Alias for backward compatibility
export const verifyToken = verifyAuth;