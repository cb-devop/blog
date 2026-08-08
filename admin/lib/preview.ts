import { createHmac, timingSafeEqual } from "crypto";

// Preview tokens are HMACs of the slug, signed with the JWT secret.
// Only the admin app can generate them; the public API accepts a valid
// token to serve a non-published post for previewing.
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set.");
}
const JWT_SECRET: string = secret;

export function generatePreviewToken(slug: string): string {
  return createHmac("sha256", JWT_SECRET).update(`preview:${slug}`).digest("hex");
}

export function verifyPreviewToken(slug: string, token: string | null): boolean {
  if (!slug || !token) return false;
  const expected = generatePreviewToken(slug);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
