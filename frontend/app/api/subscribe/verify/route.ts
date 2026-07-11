import { NextResponse } from "next/server";

const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://localhost:3001";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      // Redirect to home with error
      return NextResponse.redirect(new URL("/?verify=missing-token", request.url));
    }

    const response = await fetch(`${ADMIN_API_URL}/api/subscribers/verify?token=${encodeURIComponent(token)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (data.valid) {
      if (data.alreadyVerified) {
        return NextResponse.redirect(new URL("/?verify=already-verified", request.url));
      }
      return NextResponse.redirect(new URL("/?verify=success", request.url));
    } else {
      return NextResponse.redirect(new URL("/?verify=invalid", request.url));
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/?verify=error", request.url));
  }
}
