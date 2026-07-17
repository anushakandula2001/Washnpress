"use client";

import { useRouter } from "next/navigation";
import { ResidentShell } from "@/components/resident/resident-shell";
import { PickupExperience } from "@/components/resident/pickup/PickupExperience";
import { residentProfile } from "@/lib/resident-data";
import { usePickupSchedule } from "./hooks/usePickupSchedule";

export default function PickupPage() {
  const router = useRouter();
  const {
    availableSlots,
    selectedSlot,
    selectedSlotId,
    setSelectedSlotId,
    instructions,
    setInstructions,
    loading,
    confirmed,
    error,
    confirmPickup,
    scheduleAnother,
    garments,
    setGarments,
    laundryTypes,
    toggleLaundryType,
    garmentCategories,
    toggleGarmentCategory,
    selectedAddons,
    toggleAddon,
    bookingId,
  } = usePickupSchedule();

  return (
    <ResidentShell greeting="Schedule Pickup" subtitle="Create your complete laundry order from one polished experience.">
      <PickupExperience
        availableSlots={availableSlots}
        selectedSlot={selectedSlot}
        selectedSlotId={selectedSlotId}
        onSelectSlot={setSelectedSlotId}
        garments={garments}
        onGarmentsChange={setGarments}
        laundryTypes={laundryTypes}
        onLaundryTypeToggle={toggleLaundryType}
        garmentCategories={garmentCategories}
        onGarmentCategoryToggle={toggleGarmentCategory}
        selectedAddons={selectedAddons}
        onAddonsToggle={toggleAddon}
        instructions={instructions}
        onInstructionsChange={setInstructions}
        contactNumber={residentProfile.mobile}
        loading={loading}
        error={error}
        onConfirm={confirmPickup}
        confirmed={confirmed}
        bookingId={bookingId}
        onScheduleAnother={scheduleAnother}
        onTrackOrder={() => router.push("/resident/orders")}
        onViewOrders={() => router.push("/resident/orders")}
      />
    </ResidentShell>
  );
}