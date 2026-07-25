import { NextResponse } from "next/server";
import { analyzeTicketWithAI, generateAIResponseDraft } from "@/backend/repositories/support-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, category, residentName, ticketCode } = body;

    if (description) {
      const analysis = analyzeTicketWithAI(description, category);
      const suggestedReply = generateAIResponseDraft(analysis.category, residentName || "Valued Customer", ticketCode || "SUP-DRAFT");
      return NextResponse.json({ analysis, suggestedReply });
    }

    if (category) {
      const suggestedReply = generateAIResponseDraft(category, residentName || "Valued Customer", ticketCode || "SUP-DRAFT");
      return NextResponse.json({ suggestedReply });
    }

    return NextResponse.json({ message: "Description or category required" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "AI suggestion failed" },
      { status: 500 }
    );
  }
}
