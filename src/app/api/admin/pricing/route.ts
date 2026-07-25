import { z } from "zod";
import { requireRole } from "@/backend/api/guards";
import { ok, badRequest, created } from "@/backend/api/response";
import {
  getPublicPricingCatalog,
  listGarments,
  upsertGarment,
  deleteGarment,
  setGarmentActive,
  listAddonsAdmin,
  upsertAddon,
  deleteAddon,
  setAddonActive,
  getCommerceSettings,
  updateCommerceSettings,
  listPlansAdmin,
  upsertPlan,
  setPlanActive,
  deletePlan,
} from "@/backend/repositories/admin-commerce";
import { logAudit } from "@/backend/repositories/admin";

export async function GET(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const catalog = await getPublicPricingCatalog();
  return ok({
    garments: await listGarments(true),
    addons: await listAddonsAdmin(true),
    settings: await getCommerceSettings(),
    plans: await listPlansAdmin(true),
    activeCatalog: catalog,
  });
}

const garmentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  washPriceInr: z.number().min(0),
  washIronPriceInr: z.number().min(0),
  ironPriceInr: z.number().min(0),
  dryCleanPriceInr: z.number().min(0),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  action: z.enum(["upsert", "delete", "toggle"]).optional(),
});

const addonSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(2),
  name: z.string().min(1),
  description: z.string().min(1),
  priceInr: z.number().min(0),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  action: z.enum(["upsert", "delete", "toggle"]).optional(),
});

const settingsSchema = z.object({
  minOrderAmountInr: z.number().min(0).optional(),
  deliveryFeeInr: z.number().min(0).optional(),
  freeDeliveryThresholdInr: z.number().min(0).optional(),
  gstPercent: z.number().min(0).optional(),
  serviceTaxPercent: z.number().min(0).optional(),
  otherChargesLabel: z.string().optional(),
  otherChargesInr: z.number().min(0).optional(),
});

const planSchema = z.object({
  id: z.string().uuid().optional(),
  tier: z.string().min(1),
  name: z.string().optional(),
  description: z.string().optional(),
  monthlyInr: z.number().min(0),
  quarterlyInr: z.number().min(0).optional(),
  yearlyInr: z.number().min(0).optional(),
  garmentCap: z.number().int().positive(),
  maxPickups: z.number().int().positive().optional(),
  turnaroundHours: z.number().int().positive().optional(),
  priorityPickup: z.boolean().optional(),
  freeDelivery: z.boolean().optional(),
  expressDiscountPercent: z.number().min(0).optional(),
  validityDays: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  action: z.enum(["upsert", "delete", "toggle"]).optional(),
});

const bodySchema = z.object({
  section: z.enum(["garment", "addon", "settings", "plan"]),
  garment: garmentSchema.optional(),
  addon: addonSchema.optional(),
  settings: settingsSchema.optional(),
  plan: planSchema.optional(),
});

export async function POST(request: Request) {
  const auth = await requireRole(request, "admin");
  if ("error" in auth) return auth.error;
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

  try {
    const { section } = parsed.data;
    if (section === "garment" && parsed.data.garment) {
      const g = parsed.data.garment;
      if (g.action === "delete" && g.id) {
        await deleteGarment(g.id);
        return ok({ deleted: true });
      }
      if (g.action === "toggle" && g.id) {
        return ok({ garment: await setGarmentActive(g.id, Boolean(g.isActive)) });
      }
      const garment = await upsertGarment(g);
      await logAudit({
        actorUserId: auth.session.userId,
        actorRole: "admin",
        action: g.id ? "update_garment" : "create_garment",
        entityName: "garment_catalog",
        entityId: (garment as { id: string }).id,
        afterState: garment,
      });
      return created({ garment });
    }

    if (section === "addon" && parsed.data.addon) {
      const a = parsed.data.addon;
      if (a.action === "delete" && a.id) {
        await deleteAddon(a.id);
        return ok({ deleted: true });
      }
      if (a.action === "toggle" && a.id) {
        return ok({ addon: await setAddonActive(a.id, Boolean(a.isActive)) });
      }
      const addon = await upsertAddon(a);
      return created({ addon });
    }

    if (section === "settings" && parsed.data.settings) {
      const settings = await updateCommerceSettings(parsed.data.settings);
      await logAudit({
        actorUserId: auth.session.userId,
        actorRole: "admin",
        action: "update_commerce_settings",
        entityName: "platform_commerce_settings",
        afterState: settings,
      });
      return ok({ settings });
    }

    if (section === "plan" && parsed.data.plan) {
      const p = parsed.data.plan;
      if (p.action === "delete" && p.id) {
        return ok({ result: await deletePlan(p.id) });
      }
      if (p.action === "toggle" && p.id) {
        return ok({ plan: await setPlanActive(p.id, Boolean(p.isActive)) });
      }
      const plan = await upsertPlan(p);
      return created({ plan });
    }

    return badRequest("Nothing to update");
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Update failed");
  }
}

/** Keep PATCH for legacy plan price updates */
export async function PATCH(request: Request) {
  return POST(request);
}
