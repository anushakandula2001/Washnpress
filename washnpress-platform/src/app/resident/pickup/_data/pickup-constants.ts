import type { TimeWindow } from "@/lib/types";
import type {
  GarmentOption,
  PickupDateOption,
  PickupSlotOption,
  PickupStepMeta,
  ServiceOption,
  SlotAvailability,
} from "../_types/pickup.types";

export const PICKUP_STEPS: PickupStepMeta[] = [
  { id: "slot", label: "Pickup Slot", shortLabel: "Slot" },
  { id: "garments", label: "Garments", shortLabel: "Items" },
  { id: "addons", label: "Services", shortLabel: "Extras" },
  { id: "review", label: "Review", shortLabel: "Review" },
];

export const STEP_ORDER = [...PICKUP_STEPS.map((s) => s.id), "success"] as const;

export const GARMENT_OPTIONS: GarmentOption[] = [
  { id: "shirts", name: "Shirts & Tops", description: "Casual & formal tops", icon: "shirt", weightKg: 0.25 },
  { id: "trousers", name: "Trousers & Jeans", description: "Pants, denim, chinos", icon: "pants", weightKg: 0.4 },
  { id: "dresses", name: "Dresses & Kurtas", description: "Ethnic & western wear", icon: "dress", weightKg: 0.35 },
  { id: "bedding", name: "Bedding", description: "Sheets, covers, pillowcases", icon: "bed", weightKg: 0.8 },
  { id: "towels", name: "Towels", description: "Bath & hand towels", icon: "towel", weightKg: 0.45 },
  { id: "others", name: "Other Items", description: "Misc. garments & soft goods", icon: "package", weightKg: 0.3 },
];

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: "wash-fold", name: "Wash & Fold", description: "Everyday laundry, neatly folded", priceInr: 0, icon: "fold" },
  { id: "wash-iron", name: "Wash & Iron", description: "Wash plus crisp professional press", priceInr: 49, icon: "iron" },
  { id: "dry-cleaning", name: "Dry Cleaning", description: "Premium care for suits & sarees", priceInr: 80, icon: "shirt" },
  { id: "steam-iron", name: "Steam Iron", description: "Gentle steam press for delicate fabrics", priceInr: 39, icon: "steam" },
  { id: "express", name: "Express Delivery", description: "Priority turnaround within 12 hours", priceInr: 199, icon: "zap" },
  { id: "shoes", name: "Shoe Cleaning", description: "Deep clean for leather & canvas", priceInr: 150, icon: "footprints" },
  { id: "curtains", name: "Curtain Cleaning", description: "Specialized wash for home textiles", priceInr: 249, icon: "curtains" },
];

export const MAX_INSTRUCTIONS = 240;
export const TAX_RATE = 0.05;
export const BASE_PICKUP_FEE = 0;

const WINDOW_SLOTS: Record<TimeWindow, Array<{ start: string; end: string; label: string }>> = {
  Morning: [
    { start: "09:00", end: "11:00", label: "9:00 – 11:00" },
    { start: "11:00", end: "13:00", label: "11:00 – 1:00" },
  ],
  Afternoon: [
    { start: "13:00", end: "15:00", label: "1:00 – 3:00" },
    { start: "15:00", end: "17:00", label: "3:00 – 5:00" },
  ],
  Evening: [
    { start: "18:00", end: "20:00", label: "6:00 – 8:00" },
    { start: "20:00", end: "21:30", label: "8:00 – 9:30" },
  ],
};

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function capacityFor(seed: string): number {
  return hashSeed(seed) % 6;
}

function availabilityFromCapacity(remaining: number): SlotAvailability {
  if (remaining <= 0) return "booked";
  if (remaining <= 2) return "few";
  return "available";
}

export function buildDateOptions(from = new Date(), count = 7): PickupDateOption[] {
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const iso = toIsoDate(date);
    const isToday = i === 0;
    const isTomorrow = i === 1;

    let label: string;
    if (isToday) label = "Today";
    else if (isTomorrow) label = "Tomorrow";
    else label = date.toLocaleDateString("en-IN", { weekday: "short" });

    return {
      iso,
      label,
      weekday: date.toLocaleDateString("en-IN", { weekday: "short" }),
      dayNumber: date.getDate(),
      monthShort: date.toLocaleDateString("en-IN", { month: "short" }),
      isToday,
      isTomorrow,
    };
  });
}

export function buildSlotOptions(dates: PickupDateOption[]): PickupSlotOption[] {
  const windows = Object.keys(WINDOW_SLOTS) as TimeWindow[];
  const slots: PickupSlotOption[] = [];

  for (const date of dates) {
    for (const window of windows) {
      for (const slot of WINDOW_SLOTS[window]) {
        const id = `${date.iso}-${window}-${slot.start}`;
        const remainingCapacity = capacityFor(id);
        slots.push({
          id,
          date: date.iso,
          window,
          startTime24h: slot.start,
          endTime24h: slot.end,
          remainingCapacity,
          availability: availabilityFromCapacity(remainingCapacity),
          label: slot.label,
        });
      }
    }
  }

  return slots;
}

export function formatTimeDisplay(time24h: string): string {
  const [h, m] = time24h.split(":");
  const hour = Number.parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function formatSlotSummary(slot: PickupSlotOption): string {
  return `${formatTimeDisplay(slot.startTime24h)} – ${formatTimeDisplay(slot.endTime24h)} · ${slot.window}`;
}

export function estimateWeightKg(
  garments: Record<string, number>,
  options: GarmentOption[] = GARMENT_OPTIONS,
): number {
  return options.reduce((sum, g) => sum + (garments[g.id] ?? 0) * g.weightKg, 0);
}

export function totalGarmentCount(garments: Record<string, number>): number {
  return Object.values(garments).reduce((sum, n) => sum + n, 0);
}

export function servicesTotal(
  selectedIds: string[],
  options: ServiceOption[] = SERVICE_OPTIONS,
): number {
  return options.filter((s) => selectedIds.includes(s.id)).reduce((sum, s) => sum + s.priceInr, 0);
}

export function computeCharges(
  selectedServiceIds: string[],
  options: ServiceOption[] = SERVICE_OPTIONS,
  taxRate = TAX_RATE,
  deliveryFee = BASE_PICKUP_FEE,
) {
  const services = servicesTotal(selectedServiceIds, options);
  const subtotal = deliveryFee + services;
  const tax = Math.round(subtotal * taxRate);
  const grandTotal = subtotal + tax;
  return { services, subtotal, tax, grandTotal, deliveryFee };
}
