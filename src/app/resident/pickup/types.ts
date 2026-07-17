import type { ResidentPickup } from "@/lib/resident-data";

/**
 * Pickup slot returned from the scheduling API
 */
export interface PickupSlot {
  id: string;
  date: string;
  window: string;
  startTime24h: string;
  endTime24h: string;
  remainingCapacity: number;
}

/**
 * API request payload
 */
export interface PickupRequest {
  preferredWindows: string[];
  instructions: string;
}

/**
 * API response payload
 */
export interface PickupResponse {
  success: boolean;
  message?: string;
  slot: PickupSlot;
}

/**
 * Hook state
 */
export interface PickupScheduleState {
  pickup: ResidentPickup;

  availableSlots: PickupSlot[];

  selectedSlot: PickupSlot | null;

  selectedSlotId: string | null;

  instructions: string;

  loading: boolean;

  confirmed: boolean;

  error: string;
}

/**
 * Hook actions
 */
export interface PickupScheduleActions {
  setSelectedSlotId: (slotId: string | null) => void;

  setInstructions: (value: string) => void;

  confirmPickup: () => Promise<void>;

  scheduleAnother: () => void;
}

/**
 * Hook return type
 */
export type PickupScheduleHook = PickupScheduleState &
  PickupScheduleActions;

/**
 * Pickup Slot List Component
 */
export interface PickupSlotListProps {
  slots: PickupSlot[];

  selectedSlotId: string | null;

  onSelect: (slotId: string) => void;
}

/**
 * Pickup Summary Component
 */
export interface PickupSummaryProps {
  slot: PickupSlot | null;
}

/**
 * Pickup Details Form Component
 */
export interface PickupDetailsFormProps {
  mobile: string;

  instructions: string;

  onInstructionsChange: (value: string) => void;

  loading: boolean;

  error: string;

  disabled: boolean;

  onConfirm: () => void;
}

/**
 * Pickup Confirmation Component
 */
export interface PickupConfirmationProps {
  pickup: ResidentPickup;

  mobile: string;

  instructions: string;

  onScheduleAnother: () => void;
}