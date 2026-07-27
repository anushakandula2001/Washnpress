import { describe, expect, it } from "vitest";
import { computeCharges } from "./pickup-constants";

describe("pickup pricing", () => {
  it("includes garment and service charges in the grand total", () => {
    const charges = computeCharges(
      ["wash-iron"],
      [{ id: "wash-iron", name: "Wash & Iron", description: "", priceInr: 49, icon: "iron" }],
      0.05,
      0,
      { shirts: 2 },
      [{ id: "shirts", name: "Shirts", description: "", icon: "shirt", weightKg: 0.25, priceInr: 70 }],
    );

    expect(charges.garmentSubtotal).toBe(140);
    expect(charges.services).toBe(49);
    expect(charges.grandTotal).toBe(198);
  });
});
