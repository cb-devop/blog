import { NextResponse } from "next/server";
import { requireAdmin, apiError, logAudit } from "@/lib/security";
import { getSecuritySettings, updateSecuritySettings } from "@/lib/security-settings";

export async function GET() {
  try {
    return NextResponse.json(getSecuritySettings());
  } catch (error) {
    console.error("Error fetching security settings:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth) return apiError("Unauthorized", 401);

    const data = await request.json();
    const settings = updateSecuritySettings(data);

    logAudit("security.update", auth.userId, "Updated security settings", request);

    return NextResponse.json({
      message: "Security settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Error updating security settings:", error);
    return apiError("Internal server error", 500);
  }
}
