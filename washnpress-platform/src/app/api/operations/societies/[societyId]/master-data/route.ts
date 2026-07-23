import { NextResponse } from "next/server";
import { getSocietyMasterData, updateMasterDataHierarchy } from "@/backend/repositories/society-setup";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ societyId: string }> }
) {
  try {
    const { societyId } = await params;
    const data = await getSocietyMasterData(societyId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch master data" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ societyId: string }> }
) {
  try {
    const { societyId } = await params;
    const body = await request.json();
    const data = await updateMasterDataHierarchy(societyId, body);
    return NextResponse.json({ message: "Master data updated successfully", data });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update master data" },
      { status: 500 }
    );
  }
}
