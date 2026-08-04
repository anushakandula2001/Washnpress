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
  { id: "date", label: "Pickup Slot", shortLabel: "Slot" },
  { id: "garments", label: "Garments", shortLabel: "Items" },
  { id: "addons", label: "Add-ons", shortLabel: "Extras" },
  { id: "review", label: "Review", shortLabel: "Confirm" },
];

export const STEP_ORDER = [...PICKUP_STEPS.map((s) => s.id), "success"] as const;

export const MAX_INSTRUCTIONS = 240;

export const PRIMARY_LAUNDRY_TYPES = [
  "wash-fold",
  "wash-iron",
  "dry-cleaning",
  "steam-iron",
] as const;

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
  options: GarmentOption[],
): number {
  return options.reduce((sum, g) => sum + (garments[g.id] ?? 0) * (g.weightKg ?? 0.3), 0);
}

export function totalGarmentCount(garments: Record<string, number>): number {
  return Object.values(garments).reduce((sum, n) => sum + n, 0);
}

export function servicesTotal(
  selectedIds: string[],
  options: ServiceOption[],
): number {
  return options.filter((s) => selectedIds.includes(s.id)).reduce((sum, s) => sum + s.priceInr, 0);
}

export function garmentCostsTotal(
  garments: Record<string, number>,
  garmentOptions: GarmentOption[],
): number {
  return garmentOptions.reduce(
    (sum, g) => sum + (garments[g.id] ?? 0) * (g.washPriceInr ?? 0),
    0,
  );
}

export function computeCharges(
  selectedServiceIds: string[],
  garments: Record<string, number> = {},
  garmentOptions: GarmentOption[],
  serviceOptions: ServiceOption[],
  taxRate: number,
  deliveryFee: number,
) {
  const garmentCosts = garmentCostsTotal(garments, garmentOptions);
  const services = servicesTotal(selectedServiceIds, serviceOptions);
  const subtotal = deliveryFee + garmentCosts + services;
  const tax = Math.round(subtotal * taxRate);
  const grandTotal = subtotal + tax;
  return { garmentCosts, services, deliveryFee, subtotal, tax, grandTotal };
}
