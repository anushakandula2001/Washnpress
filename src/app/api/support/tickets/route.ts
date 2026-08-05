import { withErrorHandling } from "@/backend/api/response";
import { NextResponse } from "next/server";
import { requireResident } from "@/backend/api/guards";
import { createSupportTicket, listSupportTickets } from "@/backend/repositories/support";

async function _GET(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const assignedTeam = searchParams.get("assignedTeam") || undefined;
    const assignedUserId = searchParams.get("assignedUserId") || undefined;
    const search = searchParams.get("search") || undefined;
    const slaBreached = searchParams.get("slaBreached") === "true";

    const tickets = await listSupportTickets({
      status,
      priority,
      assignedTeam,
      assignedUserId,
      residentId: auth.session.residentId ?? undefined,
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

async function _POST(request: Request) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const { description, category, orderId, societyId, priority } = body;

    if (!description || typeof description !== "string" || description.trim().length < 5) {
      return NextResponse.json(
        { message: "Description is required (at least 5 characters)" },
        { status: 400 }
      );
    }

    const ticket = await createSupportTicket({
      residentId: auth.session.residentId!,
      description: description.trim(),
      category,
      orderId,
      societyId: societyId ?? auth.session.societyId ?? undefined,
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


export const GET = withErrorHandling(_GET);
export const POST = withErrorHandling(_POST);
