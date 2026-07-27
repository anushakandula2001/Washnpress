import { NextResponse } from "next/server";
import { assignTicket } from "@/backend/repositories/support";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, team, userId, userName, actorName } = body;

    if (!ticketId || !team) {
      return NextResponse.json({ message: "Ticket ID and team are required" }, { status: 400 });
    }

    const result = await assignTicket(ticketId, team, userId, userName, actorName || "Manager");
    return NextResponse.json({ message: "Ticket assigned successfully", result });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to assign ticket" },
      { status: 500 }
    );
  }
}
