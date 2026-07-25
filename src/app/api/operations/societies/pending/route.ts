import { NextResponse } from "next/server";
import { listPendingSocieties } from "@/backend/repositories/society-setup";
import { getSession } from "@/backend/api/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const societies = await listPendingSocieties(session.userId);
    return NextResponse.json({ societies });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch pending societies" },
      { status: 500 }
    );
  }
}
