import { requireResident } from "@/backend/api/guards";
import { findInvoiceById } from "@/backend/repositories/billing-ext";
import { notFound } from "@/backend/api/response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const invoice = await findInvoiceById(id, auth.session.residentId!);
  if (!invoice) return notFound("Invoice not found");
  const inv = invoice as { invoice_code: string; amount_inr: string; billing_month: string };
  const html = `<html><body><h1>Invoice ${inv.invoice_code}</h1><p>${inv.billing_month}</p><p>Amount: Rs.${inv.amount_inr}</p></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html", "Content-Disposition": `attachment; filename="${inv.invoice_code}.html"` } });
}