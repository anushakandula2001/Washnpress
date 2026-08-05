import { withErrorHandling } from "@/backend/api/response";
import { NextResponse } from "next/server";
import { getFlatsByFloor } from "@/backend/repositories/society-setup";

async function _GET(
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


export const GET = withErrorHandling(_GET);
