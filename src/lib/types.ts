export type PlanTier = "Basic" | "Standard" | "Premium" | "Family Pack";

export type Plan = {
  id: string;
  tier: PlanTier;
  garmentCap: number;
  turnaroundHours: number;
  monthlyInr: number;
  annualDiscountPercent: number;
  mostPopular?: boolean;
};

export type TimeWindow = "Morning" | "Afternoon" | "Evening";

export type PickupSlot = {
  id: string;
  date: string;
  window: TimeWindow;
  startTime24h: string;
  endTime24h: string;
  remainingCapacity: number;
};

export type OrderStatus =
  | "Scheduled"
  | "Picked Up"
  | "In Wash"
  | "Dry"
  | "Iron"
  | "QC Hold"
  | "Out for Delivery"
  | "Delivered";

export type Order = {
  id: string;
  residentName: string;
  flatNumber: string;
  garments: number;
  status: OrderStatus;
  pickupSlotId: string;
  waterUsedLiters?: number;
};

export type WaterLog = {
  orderId: string;
  garmentCount: number;
  actualLitersUsed: number;
  baselineLitersPerGarment: number;
};
