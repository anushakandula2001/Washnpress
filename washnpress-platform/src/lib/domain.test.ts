import {
  calculateWaterSaved,
  canCancelPickup,
  canMarkDelivered,
  choosePickupSlot,
  isOtpUsable,
  isValidIndianMobile,
  summarizeWaterLogs,
} from "@/lib/domain";
import type { PickupSlot } from "@/lib/types";

describe("domain rules", () => {
  it("validates Indian mobile numbers", () => {
    expect(isValidIndianMobile("9876543210")).toBe(true);
    expect(isValidIndianMobile("12345")).toBe(false);
  });

  it("invalidates expired OTP", () => {
    const result = isOtpUsable(
      "123456",
      "2026-07-15T09:00:00.000Z",
      0,
      new Date("2026-07-15T09:06:00.000Z"),
    );

    expect(result.ok).toBe(false);
    expect(result.reason).toContain("expired");
  });

  it("blocks OTP after too many attempts", () => {
    const result = isOtpUsable("123456", new Date().toISOString(), 5, new Date());
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("Too many attempts");
  });

  it("falls back to next available slot when preferred window is unavailable", () => {
    const slots: PickupSlot[] = [
      {
        id: "s1",
        date: "2026-07-16",
        window: "Morning",
        startTime24h: "09:00",
        endTime24h: "11:00",
        remainingCapacity: 0,
      },
      {
        id: "s2",
        date: "2026-07-16",
        window: "Evening",
        startTime24h: "18:00",
        endTime24h: "20:00",
        remainingCapacity: 1,
      },
    ];

    const result = choosePickupSlot(
      slots,
      ["Morning"],
      new Date("2026-07-16T08:00:00.000Z"),
    );

    expect(result?.id).toBe("s2");
  });

  it("applies cancellation cutoff", () => {
    const allowed = canCancelPickup(
      "2026-07-16T18:00:00.000Z",
      2,
      new Date("2026-07-16T15:00:00.000Z"),
    );

    const blocked = canCancelPickup(
      "2026-07-16T18:00:00.000Z",
      2,
      new Date("2026-07-16T16:30:00.000Z"),
    );

    expect(allowed).toBe(true);
    expect(blocked).toBe(false);
  });

  it("blocks delivery on garment mismatch", () => {
    const result = canMarkDelivered(20, 18);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("mismatch");
  });

  it("calculates and summarizes water savings", () => {
    const single = calculateWaterSaved({
      orderId: "abc",
      garmentCount: 10,
      actualLitersUsed: 50,
      baselineLitersPerGarment: 8,
    });

    const summary = summarizeWaterLogs([
      {
        orderId: "a",
        garmentCount: 10,
        actualLitersUsed: 50,
        baselineLitersPerGarment: 8,
      },
      {
        orderId: "b",
        garmentCount: 5,
        actualLitersUsed: 42,
        baselineLitersPerGarment: 8,
      },
    ]);

    expect(single).toBe(30);
    expect(summary.totalGarments).toBe(15);
    expect(summary.totalSavedLiters).toBe(30);
  });
});
