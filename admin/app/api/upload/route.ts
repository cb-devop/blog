import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAuth, apiError, logAudit } from "@/lib/security";

const maxSize = 5 * 1024 * 1024; // 5MB

// Only these folders may be written to (prevents path traversal)
const ALLOWED_FOLDERS = new Set(["uploads", "posts", "images", "logos"]);

// Magic bytes signature check — validates actual file content, not the client's MIME header
function sniffImageType(buffer: Uint8Array): string | null {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) return "image/png";
  // WEBP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return "image/webp";
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return "image/gif";
  return null;
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) return apiError("No file provided", 400);
    if (file.size > maxSize) return apiError("File too large. Maximum size is 5MB", 400);
    if (!ALLOWED_FOLDERS.has(folder)) {
      return apiError("Invalid upload folder", 400);
    }

    // Verify actual file content (magic bytes), never trust the client MIME header
    const bytes = new Uint8Array(await file.arrayBuffer());
    const detectedType = sniffImageType(bytes);
    if (!detectedType) {
      return apiError("Invalid file type. Allowed: JPEG, PNG, WebP, GIF", 400);
    }

    // Extension derived from the detected type, not the user-supplied filename
    const ext = EXT_BY_TYPE[detectedType];
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", folder);
    await mkdir(uploadDir, { recursive: true });

    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

    const url = `/${folder}/${filename}`;
    logAudit("file.upload", auth.userId, `Uploaded: ${filename}`, request);
    return NextResponse.json({ url, filename }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return apiError("Upload failed. Please try again.", 500);
  }
}
