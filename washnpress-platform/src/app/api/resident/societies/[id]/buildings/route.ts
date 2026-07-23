import { NextResponse } from "next/server";
import { getBuildingsBySociety } from "@/backend/repositories/society-setup";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const buildings = await getBuildingsBySociety(id);
    return NextResponse.json({ buildings });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch buildings" },
      { status: 500 }
    );
  }
}
