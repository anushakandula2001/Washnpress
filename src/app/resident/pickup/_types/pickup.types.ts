import type { TimeWindow } from "@/lib/types";

export type PickupStepId = "slot" | "garments" | "addons" | "review" | "success";

export type SlotAvailability = "available" | "few" | "booked";

export type PickupDateOption = {
  iso: string;
  label: string;
  weekday: string;
  dayNumber: number;
  monthShort: string;
  isToday: boolean;
  isTomorrow: boolean;
};

export type PickupSlotOption = {
  id: string;
  date: string;
  window: TimeWindow;
  startTime24h: string;
  endTime24h: string;
  remainingCapacity: number;
  availability: SlotAvailability;
  label: string;
};

export type GarmentOption = {
  id: string;
  name: string;
  description: string;
  icon: string;
  weightKg: number;
};

export type ServiceOption = {
  id: string;
  name: string;
  description: string;
  priceInr: number;
  icon: string;
};

export type PickupBookingState = {
  step: PickupStepId;
  selectedDate: string | null;
  selectedSlotId: string | null;
  garments: Record<string, number>;
  selectedServiceIds: string[];
  instructions: string;
  bookingId: string | null;
  submitting: boolean;
  slotsLoading: boolean;
  direction: 1 | -1;
};

export type PickupStepMeta = {
  id: Exclude<PickupStepId, "success">;
  label: string;
  shortLabel: string;
};
