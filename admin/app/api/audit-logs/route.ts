import { NextResponse } from "next/server";
import { requireAdmin, apiError, getAuditLog } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action") || "";
    const userId = searchParams.get("userId") || "";

    let logs = getAuditLog();

    // Filter by action type
    if (action) {
      logs = logs.filter((log) => log.action.toLowerCase().includes(action.toLowerCase()));
    }

    // Filter by userId
    if (userId) {
      logs = logs.filter((log) => log.userId.includes(userId));
    }

    const total = logs.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedLogs = logs.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return apiError("Internal server error", 500);
  }
}
