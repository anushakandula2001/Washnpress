import { NextResponse } from "next/server";
import { addTicketMessage } from "@/backend/repositories/support";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, senderUserId, senderName, senderType, channel, message } = body;

    if (!ticketId || !message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ message: "Ticket ID and message body are required" }, { status: 400 });
    }

    const msg = await addTicketMessage({
      ticketId,
      senderUserId,
      senderName: senderName || "Staff User",
      senderType: senderType || "support",
      channel: channel || "customer",
      message: message.trim(),
    });

    return NextResponse.json({ message: "Message added successfully", data: msg });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to add message" },
      { status: 500 }
    );
  }
}
