import { withErrorHandling } from "@/backend/api/response";
import { NextResponse } from "next/server";
import { getSupportDashboardStats } from "@/backend/repositories/support";

async function _GET() {
  try {
    const stats = await getSupportDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch support dashboard stats" },
      { status: 500 }
    );
  }
}


export const GET = withErrorHandling(_GET);
