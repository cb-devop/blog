import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/security";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { host, port, username, password, fromEmail, fromName, useSSL } = await request.json();

    if (!host || !username || !password) {
      return NextResponse.json({ success: false, error: "SMTP host, username, and password are required" });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: port || 587,
      secure: useSSL || false,
      auth: { user: username, pass: password },
    });

    await transporter.verify();

    return NextResponse.json({ success: true, message: "SMTP connection verified successfully" });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to connect to SMTP server",
    });
  }
}
