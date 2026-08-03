import { withErrorHandling } from "@/backend/api/response";
import { NextResponse } from "next/server";
import { addTicketAttachment } from "@/backend/repositories/support";

async function _POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, fileUrl, fileName, fileType } = body;

    if (!ticketId || !fileUrl || !fileName) {
      return NextResponse.json({ message: "Ticket ID, file URL, and file name are required" }, { status: 400 });
    }

    const att = await addTicketAttachment(ticketId, fileUrl, fileName, fileType);
    return NextResponse.json({ message: "Attachment added successfully", attachment: att });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to add attachment" },
      { status: 500 }
    );
  }
}


export const POST = withErrorHandling(_POST);
