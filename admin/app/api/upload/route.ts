import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAuth, apiError, logAudit } from "@/lib/security";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxSize = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) return apiError("No file provided", 400);
    if (!allowedTypes.includes(file.type)) return apiError("Invalid file type. Allowed: JPEG, PNG, WebP, GIF", 400);
    if (file.size > maxSize) return apiError("File too large. Maximum size is 5MB", 400);

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", folder);
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

    const url = `/${folder}/${filename}`;
    logAudit("file.upload", auth.userId, `Uploaded: ${filename}`, request);
    return NextResponse.json({ url, filename }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return apiError("Upload failed. Please try again.", 500);
  }
}
