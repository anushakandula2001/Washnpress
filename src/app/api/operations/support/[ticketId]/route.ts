import { withErrorHandling } from "@/backend/api/response";
import { NextResponse } from "next/server";
import { getSession } from "@/backend/api/session";
import { getSupportTicketDetails, updateTicketFields } from "@/backend/repositories/support-hub";

async function _GET(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { ticketId } = await params;
    const details = await getSupportTicketDetails(ticketId);
    if (!details) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error("Failed to fetch ticket details:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to load ticket details" },
      { status: 500 }
    );
  }
}

async function _PATCH(
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
    
    // Validate inputs
    const { status, priority, assignedUserId } = body;
    
    const success = await updateTicketFields(ticketId, { status, priority, assignedUserId });
    if (!success) {
      return NextResponse.json({ message: "Update failed or no fields provided" }, { status: 400 });
    }

    return NextResponse.json({ message: "Ticket updated successfully" });
  } catch (error) {
    console.error("Failed to update ticket:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update ticket" },
      { status: 500 }
    );
  }
}


export const GET = withErrorHandling(_GET);
export const PATCH = withErrorHandling(_PATCH);
