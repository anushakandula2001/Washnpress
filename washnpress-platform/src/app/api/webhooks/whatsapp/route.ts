import { ok } from "@/backend/api/response";
export async function POST(request: Request) {
  const payload = await request.json();
  return ok({ received: true, channel: "whatsapp", payload });
}