import { requireResident } from "@/backend/api/guards";
import { findInvoiceById } from "@/backend/repositories/billing-ext";
import { ok, notFound } from "@/backend/api/response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const invoice = await findInvoiceById(id, auth.session.residentId!);
  if (!invoice) return notFound("Invoice not found");
  return ok({ invoice });
}