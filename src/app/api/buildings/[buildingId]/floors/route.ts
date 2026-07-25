import { NextResponse } from "next/server";
import { getFloorsByBuilding } from "@/backend/repositories/society-setup";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ buildingId: string }> }
) {
  try {
    const { buildingId } = await params;
    const floors = await getFloorsByBuilding(buildingId);
    return NextResponse.json({ floors });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch floors" },
      { status: 500 }
    );
  }
}
