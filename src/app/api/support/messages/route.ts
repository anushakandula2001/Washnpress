import { withErrorHandling } from "@/backend/api/response";
import { NextResponse } from "next/server";
import { requireSession } from "@/backend/api/guards";
import { addTicketMessage } from "@/backend/repositories/support";

async function _POST(request: Request) {
  const auth = await requireSession(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const { ticketId, message } = body;

    if (!ticketId || !message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ message: "Ticket ID and message body are required" }, { status: 400 });
    }

    const isResident = (auth.session.roles ?? []).includes("resident");
    const senderType = isResident ? "resident" : "support";

    const msg = await addTicketMessage({
      ticketId,
      senderUserId: auth.session.userId,
      senderName: auth.session.fullName || "Support User",
      senderType,
      channel: "customer",
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


export const POST = withErrorHandling(_POST);
