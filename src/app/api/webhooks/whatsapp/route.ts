import { withErrorHandling } from "@/backend/api/response";
import { ok } from "@/backend/api/response";
async function _POST(request: Request) {
  const payload = await request.json();
  return ok({ received: true, channel: "whatsapp", payload });
}

export const POST = withErrorHandling(_POST);
