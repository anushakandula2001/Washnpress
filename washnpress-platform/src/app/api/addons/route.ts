import { listAddons } from "@/backend/repositories/billing";
import { ok } from "@/backend/api/response";

export async function GET() {
  const addons = await listAddons();
  return ok({
    addons: addons.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      description: a.description,
      priceInr: parseFloat(a.price_inr),
      icon: a.icon,
    })),
  });
}
