"use client";

import { useMemo, useState } from "react";
import { pickupSlots } from "@/lib/mock-data";
import { type ResidentOrder, type ResidentPickup } from "@/lib/resident-data";
import { useResident } from "@/components/resident/resident-provider";

export function usePickupSchedule() {
  const { pickup, reschedulePickup, addOrder } = useResident();

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");
  const [garments, setGarments] = useState(18);
  const [laundryTypes, setLaundryTypes] = useState<string[]>(["Daily Wear"]);
  const [garmentCategories, setGarmentCategories] = useState<string[]>(["Shirts"]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["addon-1"]);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState<string>("WNP-10024");

  const availableSlots = useMemo(
    () => pickupSlots.filter((slot) => slot.remainingCapacity > 0),
    []
  );

  const selectedSlot = useMemo(
    () => availableSlots.find((slot) => slot.id === selectedSlotId) ?? null,
    [availableSlots, selectedSlotId]
  );

  function toggleLaundryType(value: string) {
    setLaundryTypes((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

  function toggleGarmentCategory(value: string) {
    setGarmentCategories((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

  function toggleAddon(value: string) {
    setSelectedAddons((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

  async function confirmPickup() {
    if (loading) return;

    setError("");

    if (!selectedSlot) {
      setError("Please select a pickup slot.");
      return;
    }

    if (garments <= 0) {
      setError("Garments cannot be zero.");
      return;
    }

    setLoading(true);

    try {
      const nextBookingId = `WNP-${Date.now().toString().slice(-5)}`;
      const newPickup: ResidentPickup = {
        id: nextBookingId,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime24h,
        endTime: selectedSlot.endTime24h,
        window: selectedSlot.window,
        status: "scheduled",
        instructions,
        garments,
        laundryTypes,
        garmentCategories,
        addons: selectedAddons,
        contactNumber: "9876543210",
        bookingId: nextBookingId,
      };

      reschedulePickup(newPickup);

      const newOrder: ResidentOrder = {
        id: nextBookingId,
        placedDate: new Date().toLocaleDateString("en-CA"),
        pickupDate: selectedSlot.date,
        pickupTime: `${selectedSlot.startTime24h} – ${selectedSlot.endTime24h}`,
        garments,
        addons: selectedAddons.map((addonId) => addonId.replace("addon-", "Service ")),
        status: "Scheduled",
        displayStatus: "Pickup Scheduled",
        badgeVariant: "default",
        stages: ["Pickup", "Wash", "Ironing", "QC", "Delivery"],
        currentStage: "Pickup",
      };

      addOrder(newOrder);
      setBookingId(nextBookingId);
      setConfirmed(true);
    } catch (error) {
      console.error(error);
      setError("Unable to schedule pickup. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  function scheduleAnother() {
    setConfirmed(false);
    setSelectedSlotId(null);
    setInstructions("");
    setGarments(18);
    setLaundryTypes(["Daily Wear"]);
    setGarmentCategories(["Shirts"]);
    setSelectedAddons(["addon-1"]);
    setError("");
  }

  return {
    pickup,
    availableSlots,
    selectedSlot,
    selectedSlotId,
    setSelectedSlotId,
    instructions,
    setInstructions,
    garments,
    setGarments,
    laundryTypes,
    toggleLaundryType,
    garmentCategories,
    toggleGarmentCategory,
    selectedAddons,
    toggleAddon,
    loading,
    confirmed,
    error,
    confirmPickup,
    scheduleAnother,
    bookingId,
  };
}