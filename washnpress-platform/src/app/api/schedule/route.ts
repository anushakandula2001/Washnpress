import { NextResponse } from "next/server";
import { z } from "zod";
import { choosePickupSlot } from "@/lib/domain";
import { pickupSlots } from "@/lib/mock-data";

const scheduleSchema = z.object({
  preferredWindows: z.array(z.enum(["Morning", "Afternoon", "Evening"])).default([]),
  nowIso: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = scheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const slot = choosePickupSlot(
    pickupSlots,
    parsed.data.preferredWindows,
    parsed.data.nowIso ? new Date(parsed.data.nowIso) : new Date(),
  );

  if (!slot) {
    return NextResponse.json({ message: "No slot available" }, { status: 404 });
  }

  return NextResponse.json({ slot }, { status: 200 });
}
