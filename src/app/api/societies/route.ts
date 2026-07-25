import { listSocieties } from "@/backend/repositories/societies";
import { ok } from "@/backend/api/response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const city = url.searchParams.get("city") ?? undefined;

  const societies = await listSocieties(city);

  return ok({
    societies: societies.map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address_line_1 ?? "",
      city: s.city,
      state: s.state,
      pincode: s.pincode,
      status: s.status === "active" ? "Active" : s.status === "coming_soon" ? "Coming Soon" : "Inactive",
    })),
  });
}
