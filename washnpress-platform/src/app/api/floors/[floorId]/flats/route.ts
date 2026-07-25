import { NextResponse } from "next/server";
import { getFlatsByFloor } from "@/backend/repositories/society-setup";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ floorId: string }> }
) {
  try {
    const { floorId } = await params;
    const flats = await getFlatsByFloor(floorId);
    return NextResponse.json({ flats });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch flats" },
      { status: 500 }
    );
  }
}
