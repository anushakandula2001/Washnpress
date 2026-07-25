import { NextResponse } from "next/server";
import { getSession } from "@/backend/api/session";
import { addTicketMessage } from "@/backend/repositories/support-hub";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { ticketId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ message: "Message body is required" }, { status: 400 });
    }

    const newMsg = await addTicketMessage(ticketId, session.userId, message.trim());
    return NextResponse.json({ message: "Message added", data: newMsg });
  } catch (error) {
    console.error("Failed to add message:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to add message" },
      { status: 500 }
    );
  }
}
