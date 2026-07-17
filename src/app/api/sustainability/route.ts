import { NextResponse } from "next/server";
import { summarizeWaterLogs } from "@/lib/domain";
import { waterLogs } from "@/lib/mock-data";

export async function GET() {
  const summary = summarizeWaterLogs(waterLogs);
  return NextResponse.json(summary, { status: 200 });
}
