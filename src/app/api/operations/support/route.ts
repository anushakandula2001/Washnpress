import { NextResponse } from "next/server";
import { getSession } from "@/backend/api/session";
import { listUnifiedSupportTickets } from "@/backend/repositories/support-hub";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const tab = searchParams.get("tab") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let executiveUserId: string | undefined = undefined;
    if (tab === "assigned_to_me") {
      executiveUserId = session.userId;
    }

    const result = await listUnifiedSupportTickets({
      status: tab === "open" ? "open" : (tab === "resolved" ? "resolved" : (tab === "escalated" ? "escalated" : status)),
      priority: tab === "escalated" ? "critical" : priority,
      category,
      executiveUserId,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to load support tickets" },
      { status: 500 }
    );
  }
}
