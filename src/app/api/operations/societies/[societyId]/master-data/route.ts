import { withErrorHandling } from "@/backend/api/response";
import { NextResponse } from "next/server";
import { getSession } from "@/backend/api/session";
import { checkExecutiveAssignment, getSocietyMasterData, updateMasterDataHierarchy } from "@/backend/repositories/society-setup";

async function _GET(
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

    const data = await getSocietyMasterData(societyId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch master data" },
      { status: 500 }
    );
  }
}

async function _PUT(
  request: Request,
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


export const GET = withErrorHandling(_GET);
export const PUT = withErrorHandling(_PUT);
