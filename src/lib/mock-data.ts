import type { Order, PickupSlot, Plan, WaterLog } from "@/lib/types";

export const plans: Plan[] = [
  {
    id: "plan-basic",
    tier: "Basic",
    garmentCap: 35,
    turnaroundHours: 48,
    monthlyInr: 1499,
    annualDiscountPercent: 10,
  },
  {
    id: "plan-standard",
    tier: "Standard",
    garmentCap: 60,
    turnaroundHours: 36,
    monthlyInr: 2199,
    annualDiscountPercent: 12,
    mostPopular: true,
  },
  {
    id: "plan-premium",
    tier: "Premium",
    garmentCap: 90,
    turnaroundHours: 24,
    monthlyInr: 2999,
    annualDiscountPercent: 15,
  },
  {
    id: "plan-family",
    tier: "Family Pack",
    garmentCap: 160,
    turnaroundHours: 24,
    monthlyInr: 4599,
    annualDiscountPercent: 18,
  },
];

export const pickupSlots: PickupSlot[] = [
  {
    id: "slot-1",
    date: "2026-07-16",
    window: "Morning",
    startTime24h: "09:00",
    endTime24h: "11:00",
    remainingCapacity: 0,
  },
  {
    id: "slot-2",
    date: "2026-07-16",
    window: "Evening",
    startTime24h: "18:00",
    endTime24h: "20:00",
    remainingCapacity: 2,
  },
  {
    id: "slot-3",
    date: "2026-07-17",
    window: "Morning",
    startTime24h: "10:00",
    endTime24h: "12:00",
    remainingCapacity: 4,
  },
];

export const orders: Order[] = [
  {
    id: "WNP-10021",
    residentName: "Asha Nair",
    flatNumber: "B-805",
    garments: 18,
    status: "In Wash",
    pickupSlotId: "slot-2",
    waterUsedLiters: 112,
  },
  {
    id: "WNP-10022",
    residentName: "Ritika Sharma",
    flatNumber: "A-102",
    garments: 12,
    status: "QC Hold",
    pickupSlotId: "slot-2",
    waterUsedLiters: 86,
  },
  {
    id: "WNP-10023",
    residentName: "Neha Singh",
    flatNumber: "C-1104",
    garments: 25,
    status: "Out for Delivery",
    pickupSlotId: "slot-3",
    waterUsedLiters: 140,
  },
];

export const waterLogs: WaterLog[] = [
  {
    orderId: "WNP-10021",
    garmentCount: 18,
    actualLitersUsed: 112,
    baselineLitersPerGarment: 8,
  },
  {
    orderId: "WNP-10022",
    garmentCount: 12,
    actualLitersUsed: 86,
    baselineLitersPerGarment: 8,
  },
  {
    orderId: "WNP-10023",
    garmentCount: 25,
    actualLitersUsed: 140,
    baselineLitersPerGarment: 8,
  },
];
