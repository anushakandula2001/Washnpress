import type { DbOrder, DbPickupSlot, DbSubscription, DbPlan } from "@/backend/types";
import type { PickupSlot, TimeWindow } from "@/lib/types";

const ORDER_STAGES = ["Pickup", "Wash", "Ironing", "QC", "Delivery"] as const;

const STATUS_TO_STAGE: Record<string, (typeof ORDER_STAGES)[number]> = {
  Scheduled: "Pickup",
  "Picked Up": "Pickup",
  "In Wash": "Wash",
  Dry: "Wash",
  Iron: "Ironing",
  "QC Hold": "QC",
  "Out for Delivery": "Delivery",
  Delivered: "Delivery",
};

const STATUS_DISPLAY: Record<string, { label: string; variant: "default" | "secondary" | "success" }> = {
  Scheduled: { label: "Scheduled", variant: "secondary" },
  "Picked Up": { label: "Picked Up", variant: "default" },
  "In Wash": { label: "In Wash", variant: "default" },
  Dry: { label: "Drying", variant: "default" },
  Iron: { label: "Ironing", variant: "default" },
  "QC Hold": { label: "QC Hold", variant: "secondary" },
  "Out for Delivery": { label: "Out for Delivery", variant: "default" },
  Delivered: { label: "Delivered", variant: "success" },
};

export function toPickupSlot(slot: DbPickupSlot): PickupSlot {
  const startTime = slot.start_time.slice(0, 5);
  const endTime = slot.end_time.slice(0, 5);
  return {
    id: slot.id,
    date: slot.slot_date,
    window: slot.window as TimeWindow,
    startTime24h: startTime,
    endTime24h: endTime,
    remainingCapacity: slot.capacity_remaining,
  };
}

export function toResidentOrder(order: DbOrder) {
  const currentStage = STATUS_TO_STAGE[order.status] ?? "Pickup";
  const display = STATUS_DISPLAY[order.status] ?? { label: order.status, variant: "default" as const };
  const scheduled = new Date(order.scheduled_for);
  const created =
    typeof order.created_at === "string"
      ? order.created_at
      : new Date(order.created_at as unknown as string | number | Date).toISOString();

  return {
    id: order.order_code,
    placedDate: created.split("T")[0],
    pickupDate: scheduled.toISOString().split("T")[0],
    pickupTime: `${scheduled.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
    garments: order.pickup_garment_count,
    addons: [] as string[],
    status: order.status,
    displayStatus: display.label,
    badgeVariant: display.variant,
    stages: [...ORDER_STAGES],
    currentStage,
  };
}

export function toSubscriptionResponse(sub: DbSubscription) {
  const cycleEnd = new Date(sub.cycle_end);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((cycleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    id: sub.id,
    planId: sub.plan_id,
    planName: `${sub.tier} Plan`,
    tier: sub.tier,
    status: sub.status,
    garmentsUsed: sub.garments_used,
    garmentCap: sub.garment_cap,
    daysRemaining,
    renewsOn: cycleEnd.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    monthlyInr: parseFloat(sub.monthly_inr),
    autoRenew: sub.auto_renew,
    turnaroundHours: sub.turnaround_hours,
    usagePercent: Math.round((sub.garments_used / sub.garment_cap) * 100),
  };
}

export function toPlanResponse(plan: DbPlan, currentPlanId?: string) {
  const features = [
    `${plan.garment_cap} Garments / month`,
    `${plan.turnaround_hours}h Turnaround`,
    plan.max_pickups ? `${plan.max_pickups} Pickups / cycle` : null,
    plan.free_delivery ? "Free Delivery" : "Standard Delivery",
    plan.priority_pickup ? "Priority Pickup" : null,
    plan.express_discount_percent && parseFloat(plan.express_discount_percent) > 0
      ? `${plan.express_discount_percent}% Express discount`
      : null,
  ].filter(Boolean) as string[];

  return {
    id: plan.id,
    tier: plan.tier,
    name: plan.name || plan.tier,
    description: plan.description ?? null,
    garmentCap: plan.garment_cap,
    turnaroundHours: plan.turnaround_hours,
    monthlyInr: parseFloat(plan.monthly_inr),
    quarterlyInr: plan.quarterly_inr ? parseFloat(plan.quarterly_inr) : null,
    yearlyInr: plan.yearly_inr ? parseFloat(plan.yearly_inr) : null,
    annualDiscountPercent: parseFloat(plan.annual_discount_percent ?? "0"),
    maxPickups: plan.max_pickups ?? null,
    priorityPickup: Boolean(plan.priority_pickup),
    freeDelivery: Boolean(plan.free_delivery),
    expressDiscountPercent: plan.express_discount_percent
      ? parseFloat(plan.express_discount_percent)
      : 0,
    validityDays: plan.validity_days ?? 30,
    isCurrent: plan.id === currentPlanId,
    features,
  };
}

export function formatWalletDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPaymentExpiry(month: number, year: number) {
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}
