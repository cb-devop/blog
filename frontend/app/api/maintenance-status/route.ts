import { NextResponse } from "next/server";

// In-memory maintenance mode state
let maintenanceMode = false;

export async function GET() {
  return NextResponse.json({
    maintenanceMode,
    message: maintenanceMode
      ? "Site is currently under maintenance"
      : "Site is operational",
  });
}

export async function PUT(request: Request) {
  try {
    const { maintenanceMode: newMode } = await request.json();

    if (typeof newMode !== "boolean") {
      return NextResponse.json(
        { error: "maintenanceMode must be a boolean" },
        { status: 400 }
      );
    }

    maintenanceMode = newMode;

    return NextResponse.json({
      maintenanceMode,
      message: maintenanceMode
        ? "Maintenance mode enabled"
        : "Maintenance mode disabled",
    });
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance status" },
      { status: 500 }
    );
  }
}
