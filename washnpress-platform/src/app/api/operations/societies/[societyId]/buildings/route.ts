import { NextResponse } from "next/server";
import { getSession } from "@/backend/api/session";
import { checkExecutiveAssignment, createBuildingAndGenerateStructure } from "@/backend/repositories/society-setup";

export async function POST(
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

    const { buildingName, floors, flatsPerFloor, numberingFormat, customPrefix } = body;

    if (!buildingName || typeof buildingName !== "string" || !buildingName.trim()) {
      return NextResponse.json({ message: "Building name is required" }, { status: 400 });
    }
    if (!floors || typeof floors !== "number" || floors < 1) {
      return NextResponse.json({ message: "Floors must be a positive number" }, { status: 400 });
    }
    if (!flatsPerFloor || typeof flatsPerFloor !== "number" || flatsPerFloor < 1) {
      return NextResponse.json({ message: "Flats per floor must be a positive number" }, { status: 400 });
    }

    const data = await createBuildingAndGenerateStructure({
      societyId,
      buildingName: buildingName.trim(),
      floors: Number(floors),
      flatsPerFloor: Number(flatsPerFloor),
      numberingFormat: numberingFormat || "101",
      customPrefix,
    });

    return NextResponse.json({
      message: `Building '${buildingName.trim()}' and structure created successfully`,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create building structure" },
      { status: 500 }
    );
  }
}
