import { withErrorHandling } from "@/backend/api/response";
import { processPaymentWebhook } from "@/backend/repositories/billing-ext";
import { ok, badRequest } from "@/backend/api/response";

async function _POST(request: Request) {
  const payload = await request.json();
  const result = await processPaymentWebhook(payload);
  if (!result) return badRequest("Invalid webhook payload");
  return ok(result);
}

export const POST = withErrorHandling(_POST);
