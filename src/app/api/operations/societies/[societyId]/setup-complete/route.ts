import { NextResponse } from "next/server";
import { getSession } from "@/backend/api/session";
import { checkExecutiveAssignment, markSocietySetupComplete } from "@/backend/repositories/society-setup";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ societyId: string }> }
) {
  try {
    const { societyId } = await params;
    
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const isAssigned = await checkExecutiveAssignment(session.userId, societyId);
    if (!isAssigned) {
      return NextResponse.json({ message: "Forbidden: You are not assigned to this society." }, { status: 403 });
    }

    const result = await markSocietySetupComplete(societyId);
    return NextResponse.json({ message: "Society setup marked as completed", result });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to complete society setup" },
      { status: 500 }
    );
  }
}
