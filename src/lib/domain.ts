import { z } from "zod";
import type { PickupSlot, TimeWindow, WaterLog } from "@/lib/types";

const indianMobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number");

const otpSchema = z.string().regex(/^\d{6}$/, "OTP must be 6 digits");

export function isValidIndianMobile(input: string): boolean {
  return indianMobileSchema.safeParse(input).success;
}

export function isOtpUsable(
  otp: string,
  issuedAtIso: string,
  attempts: number,
  now = new Date(),
): { ok: boolean; reason?: string } {
  if (!otpSchema.safeParse(otp).success) {
    return { ok: false, reason: "Invalid OTP format" };
  }

  if (attempts >= 5) {
    return { ok: false, reason: "Too many attempts. Try after 15 minutes" };
  }

  const issuedAt = new Date(issuedAtIso);
  const ageMs = now.getTime() - issuedAt.getTime();
  const maxAgeMs = 5 * 60 * 1000;

  if (ageMs > maxAgeMs) {
    return { ok: false, reason: "OTP expired" };
  }

  return { ok: true };
}

function toSlotDateTime(slot: PickupSlot): Date {
  return new Date(`${slot.date}T${slot.startTime24h}:00`);
}

export function choosePickupSlot(
  slots: PickupSlot[],
  preferredWindows: TimeWindow[],
  now = new Date(),
): PickupSlot | undefined {
  const active = slots
    .filter((slot) => slot.remainingCapacity > 0)
    .filter((slot) => toSlotDateTime(slot).getTime() >= now.getTime())
    .sort(
      (a, b) => toSlotDateTime(a).getTime() - toSlotDateTime(b).getTime(),
    );

  if (active.length === 0) {
    return undefined;
  }

  const preferred = active.find((slot) => preferredWindows.includes(slot.window));
  return preferred ?? active[0];
}

export function canCancelPickup(
  pickupDateIso: string,
  cutoffHours: number,
  now = new Date(),
): boolean {
  const pickup = new Date(pickupDateIso);
  const cutoffMs = cutoffHours * 60 * 60 * 1000;
  return pickup.getTime() - now.getTime() > cutoffMs;
}

export function canMarkDelivered(
  pickupCount: number,
  deliveryCount: number,
): { ok: boolean; reason?: string } {
  if (pickupCount !== deliveryCount) {
    return {
      ok: false,
      reason: "Garment count mismatch. Delivery is blocked until resolved.",
    };
  }
  return { ok: true };
}

export function calculateWaterSaved(log: WaterLog): number {
  const baseline = log.garmentCount * log.baselineLitersPerGarment;
  const saved = baseline - log.actualLitersUsed;
  return Number(Math.max(0, saved).toFixed(2));
}

export function summarizeWaterLogs(logs: WaterLog[]) {
  return logs.reduce(
    (acc, log) => {
      const saved = calculateWaterSaved(log);
      acc.totalGarments += log.garmentCount;
      acc.totalActualLiters += log.actualLitersUsed;
      acc.totalSavedLiters += saved;
      return acc;
    },
    {
      totalGarments: 0,
      totalActualLiters: 0,
      totalSavedLiters: 0,
    },
  );
}
