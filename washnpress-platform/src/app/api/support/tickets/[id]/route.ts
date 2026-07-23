import { NextResponse } from "next/server";
import { getSupportTicketDetails, updateTicketStatus, submitCsatRating } from "@/backend/repositories/support";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get("channel") === "customer" ? "customer" : "all";

    const data = await getSupportTicketDetails(id, channel);
    if (!data) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch ticket details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.status) {
      await updateTicketStatus(id, body.status, body.actorName || "Staff");
    }

    if (typeof body.csatRating === "number") {
      await submitCsatRating(id, body.csatRating, body.csatFeedback);
    }

    const updated = await getSupportTicketDetails(id);
    return NextResponse.json({ message: "Ticket updated successfully", data: updated });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update ticket" },
      { status: 500 }
    );
  }
}