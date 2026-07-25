import { NextResponse } from "next/server";
import { getSupportDashboardStats } from "@/backend/repositories/support";

export async function GET() {
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
