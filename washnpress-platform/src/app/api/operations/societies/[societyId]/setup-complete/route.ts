import { NextResponse } from "next/server";
import { markSocietySetupComplete } from "@/backend/repositories/society-setup";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ societyId: string }> }
) {
  try {
    const { societyId } = await params;
    const result = await markSocietySetupComplete(societyId);
    return NextResponse.json({ message: "Society setup marked as completed", result });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to complete society setup" },
      { status: 500 }
    );
  }
}
