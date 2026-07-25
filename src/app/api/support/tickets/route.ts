import { NextResponse } from "next/server";
import { createSupportTicket, listSupportTickets } from "@/backend/repositories/support";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const assignedTeam = searchParams.get("assignedTeam") || undefined;
    const assignedUserId = searchParams.get("assignedUserId") || undefined;
    const residentId = searchParams.get("residentId") || undefined;
    const search = searchParams.get("search") || undefined;
    const slaBreached = searchParams.get("slaBreached") === "true";

    const tickets = await listSupportTickets({
      status,
      priority,
      assignedTeam,
      assignedUserId,
      residentId,
      search,
      slaBreached,
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { residentId, description, category, orderId, societyId, priority } = body;

    if (!description || typeof description !== "string" || description.trim().length < 5) {
      return NextResponse.json(
        { message: "Description is required (at least 5 characters)" },
        { status: 400 }
      );
    }

    const ticket = await createSupportTicket({
      residentId: residentId || "res-1",
      description: description.trim(),
      category,
      orderId,
      societyId,
      priority,
    });

    return NextResponse.json({ message: "Support ticket created successfully", ticket });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
