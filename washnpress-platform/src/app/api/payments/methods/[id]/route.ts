import { requireResident } from "@/backend/api/guards";
import { deletePaymentMethod, setDefaultPaymentMethod } from "@/backend/repositories/billing-ext";
import { ok } from "@/backend/api/response";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await deletePaymentMethod(id, auth.session.residentId!);
  return ok({ deleted: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await setDefaultPaymentMethod(id, auth.session.residentId!);
  return ok({ updated: true, isDefault: true });
}