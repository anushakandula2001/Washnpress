import { NextResponse } from "next/server";
import { escalateTicket } from "@/backend/repositories/support";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, reason, actorName } = body;

    if (!ticketId) {
      return NextResponse.json({ message: "Ticket ID is required" }, { status: 400 });
    }

    const result = await escalateTicket(ticketId, reason || "SLA breach / urgent escalation", actorName || "Manager");
    return NextResponse.json({ message: "Ticket escalated successfully", result });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to escalate ticket" },
      { status: 500 }
    );
  }
}
