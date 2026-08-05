import { withErrorHandling } from "@/backend/api/response";
import { z } from "zod";
import { requireSession } from "@/backend/api/guards";
import { forbidden, ok, badRequest, created } from "@/backend/api/response";
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
  archivePlan,
  setPlanPopular,
  logPricingHistory,
  getPricingHistory,
  getPricingAnalytics
} from "@/backend/repositories/admin-commerce";
import { logAudit } from "@/backend/repositories/admin";
import { queryOne } from "@/backend/db/pool";

async function _GET(request: Request) {
  const auth = await requireSession(request);
  if ("error" in auth) return auth.error;

  const roles = auth.session.roles ?? [];
  const canAccess = roles.includes("admin") || roles.includes("finance_admin") || roles.includes("operator");
  if (!canAccess) {
    return forbidden("Requires admin, finance_admin, or operator role");
  }

  const catalog = await getPublicPricingCatalog();
  const history = await getPricingHistory();
  const analytics = await getPricingAnalytics();

  return ok({
    garments: await listGarments(true),
    addons: await listAddonsAdmin(true),
    settings: await getCommerceSettings(),
    plans: await listPlansAdmin(true),
    activeCatalog: catalog,
    history,
    analytics
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
  code: z.string().min(2).optional(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priceInr: z.number().min(0).optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["Low", "Normal", "High", "Urgent"]).optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  action: z.enum(["upsert", "delete", "toggle"]).optional(),
});

const settingsSchema = z.object({
  minOrderAmountInr: z.number().min(0).optional(),
  minOrderDesc: z.string().optional(),
  minOrderIsActive: z.boolean().optional(),

  deliveryFeeInr: z.number().min(0).optional(),
  deliveryFeeDesc: z.string().optional(),
  deliveryFeeIsActive: z.boolean().optional(),

  freeDeliveryThresholdInr: z.number().min(0).optional(),
  freeDeliveryDesc: z.string().optional(),
  freeDeliveryIsActive: z.boolean().optional(),

  expressDeliveryInr: z.number().min(0).optional(),
  expressDeliveryDesc: z.string().optional(),
  expressDeliveryIsActive: z.boolean().optional(),

  lateNightDeliveryInr: z.number().min(0).optional(),
  lateNightDeliveryDesc: z.string().optional(),
  lateNightDeliveryTime: z.string().optional(),
  lateNightDeliveryIsActive: z.boolean().optional(),

  gstPercent: z.number().min(0).max(100).optional(),
  gstIsActive: z.boolean().optional(),

  cgstPercent: z.number().min(0).max(100).optional(),
  cgstIsActive: z.boolean().optional(),

  sgstPercent: z.number().min(0).max(100).optional(),
  sgstIsActive: z.boolean().optional(),

  serviceTaxPercent: z.number().min(0).max(100).optional(),
  serviceTaxLabel: z.string().optional(),
  serviceTaxIsActive: z.boolean().optional(),

  packagingFeeInr: z.number().min(0).optional(),
  packagingFeeLabel: z.string().optional(),
  packagingFeeType: z.string().optional(),
  packagingFeeIsActive: z.boolean().optional(),

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
  features: z.array(z.string()).optional(),
  displayOrder: z.number().int().optional(),
  isPopular: z.boolean().optional(),
  supportType: z.string().optional(),
  action: z.enum(["upsert", "delete", "toggle", "archive", "restore", "popular"]).optional(),
});

const bodySchema = z.object({
  section: z.enum(["garment", "addon", "settings", "plan"]),
  garment: garmentSchema.optional(),
  addon: addonSchema.optional(),
  settings: settingsSchema.optional(),
  plan: planSchema.optional(),
});

async function _POST(request: Request) {
  const auth = await requireSession(request);
  if ("error" in auth) return auth.error;

  const roles = auth.session.roles ?? [];
  const canEdit = roles.includes("admin") || roles.includes("finance_admin");
  if (!canEdit) {
    return forbidden("Requires admin or finance_admin role to edit pricing");
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Invalid request", parsed.error.flatten());

  try {
    const { section } = parsed.data;
    if (section === "garment" && parsed.data.garment) {
      const g = parsed.data.garment;
      
      let prevGarment = null;
      if (g.id) {
        prevGarment = await queryOne(`SELECT * FROM garment_catalog WHERE id = $1`, [g.id]);
      }

      if (g.action === "delete" && g.id) {
        await deleteGarment(g.id);
        await logPricingHistory("garment", prevGarment?.name || g.id, prevGarment, { deleted: true }, "Garment soft-deleted", auth.session.userId);
        return ok({ deleted: true });
      }
      if (g.action === "toggle" && g.id) {
        const toggled = await setGarmentActive(g.id, Boolean(g.isActive));
        await logPricingHistory("garment", prevGarment?.name || g.id, prevGarment, toggled, "Garment toggled", auth.session.userId);
        return ok({ garment: toggled });
      }
      const garment = await upsertGarment(g);
      if (!garment) return badRequest("Garment not found");
      await logPricingHistory("garment", garment.name, prevGarment, garment, g.id ? "Garment updated" : "Garment created", auth.session.userId);
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

      let prevAddon = null;
      if (a.id) {
        prevAddon = await queryOne(`SELECT * FROM addon_services WHERE id = $1`, [a.id]);
      }

      if (a.action === "delete" && a.id) {
        await deleteAddon(a.id);
        await logPricingHistory("addon", prevAddon?.name || a.id, prevAddon, { deleted: true }, "Addon soft-deleted", auth.session.userId);
        return ok({ deleted: true });
      }
      if (a.action === "toggle" && a.id) {
        const toggled = await setAddonActive(a.id, Boolean(a.isActive));
        await logPricingHistory("addon", prevAddon?.name || a.id, prevAddon, toggled, "Addon toggled", auth.session.userId);
        return ok({ addon: toggled });
      }
      const addon = await upsertAddon(a);
      if (!addon) return badRequest("Addon not found");
      await logPricingHistory("addon", addon.name, prevAddon, addon, a.id ? "Addon updated" : "Addon created", auth.session.userId);
      return created({ addon });
    }

    if (section === "settings" && parsed.data.settings) {
      const prevSettings = await getCommerceSettings();
      const settings = await updateCommerceSettings(parsed.data.settings);
      if (!settings) return badRequest("Failed to update settings");
      
      await logPricingHistory("delivery_taxes", "Platform Settings", prevSettings, settings, "Commerce settings updated", auth.session.userId);
      
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

      let prevPlan = null;
      if (p.id) {
        prevPlan = await queryOne(`SELECT * FROM plans WHERE id = $1`, [p.id]);
      }

      if (p.action === "delete" && p.id) {
        const result = await deletePlan(p.id);
        await logPricingHistory("plan", prevPlan?.tier || p.id, prevPlan, { deleted: true }, "Plan soft-deleted", auth.session.userId);
        await logAudit({
          actorUserId: auth.session.userId,
          actorRole: "admin",
          action: "delete_plan",
          entityName: "plans",
          entityId: p.id,
          beforeState: prevPlan,
        });
        return ok({ result });
      }
      if (p.action === "toggle" && p.id) {
        const toggled = await setPlanActive(p.id, Boolean(p.isActive));
        await logPricingHistory("plan", prevPlan?.tier || p.id, prevPlan, toggled, "Plan toggled", auth.session.userId);
        return ok({ plan: toggled });
      }
      if (p.action === "archive" && p.id) {
        const archived = await archivePlan(p.id, true);
        await logPricingHistory("plan", prevPlan?.tier || p.id, prevPlan, archived, "Plan archived", auth.session.userId);
        return ok({ plan: archived });
      }
      if (p.action === "restore" && p.id) {
        const restored = await archivePlan(p.id, false);
        await logPricingHistory("plan", prevPlan?.tier || p.id, prevPlan, restored, "Plan restored", auth.session.userId);
        return ok({ plan: restored });
      }
      if (p.action === "popular" && p.id) {
        const popular = await setPlanPopular(p.id);
        await logPricingHistory("plan", prevPlan?.tier || p.id, prevPlan, popular, "Plan marked popular", auth.session.userId);
        return ok({ plan: popular });
      }
      const plan = await upsertPlan(p);
      if (!plan) return badRequest("Plan not found");
      await logPricingHistory("plan", plan.tier, prevPlan, plan, p.id ? "Plan updated" : "Plan created", auth.session.userId);
      await logAudit({
        actorUserId: auth.session.userId,
        actorRole: "admin",
        action: p.id ? "update_plan" : "create_plan",
        entityName: "plans",
        entityId: (plan as { id: string }).id,
        beforeState: prevPlan,
        afterState: plan,
      });
      return created({ plan });
    }

    return badRequest("Nothing to update");
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Update failed");
  }
}

/** Keep PATCH for legacy plan price updates */
async function _PATCH(request: Request) {
  return POST(request);
}


export const GET = withErrorHandling(_GET);
export const POST = withErrorHandling(_POST);
export const PATCH = withErrorHandling(_PATCH);
