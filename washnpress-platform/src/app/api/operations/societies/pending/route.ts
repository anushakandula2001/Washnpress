import { NextResponse } from "next/server";
import { listPendingSocieties } from "@/backend/repositories/society-setup";

export async function GET() {
  try {
    const societies = await listPendingSocieties();
    return NextResponse.json({ societies });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch pending societies" },
      { status: 500 }
    );
  }
}
