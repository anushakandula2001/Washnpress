import { NextResponse } from "next/server";
import { z } from "zod";

const qcSchema = z.object({
  orderId: z.string().min(1),
  pass: z.boolean(),
  reason: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = qcSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  if (!parsed.data.pass && !parsed.data.reason) {
    return NextResponse.json(
      { message: "QC fail reason is mandatory and opens a support ticket." },
      { status: 422 },
    );
  }

  return NextResponse.json(
    {
      orderId: parsed.data.orderId,
      status: parsed.data.pass ? "Ready for Delivery" : "QC Hold",
      supportTicketCreated: !parsed.data.pass,
    },
    { status: 200 },
  );
}
