"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ResidentShell } from "@/components/resident/resident-shell";
import { PickupProvider, usePickup } from "./_components/pickup-provider";
import { PickupStepper } from "./_components/pickup-stepper";
import { BookingSummary } from "./_components/booking-summary";
import { StepNavigation } from "./_components/step-navigation";
import { stepVariants, useMotionPrefs } from "./_components/motion-primitives";
import { SlotStep } from "./_steps/slot-step";
import { GarmentStep } from "./_steps/garnment-step";
import { AddonsStep } from "./_steps/addons-step";
import { SummaryStep } from "./_steps/summary-step";
import { SuccessStep } from "./_steps/success-step";
import { OtherClothesStep } from "./_steps/other-clothes-step";

function PickupFlow() {
  const {
    step,
    direction,
    canContinue,
    submitting,
    bookingError,
    selectedSlot,
    garments,
    selectedServiceIds,
    instructions,
    garmentOptions,
    serviceOptions,
    taxRate,
    deliveryFee,
    goBack,
    goNext,
    confirmBooking,
  } = usePickup();
  const { transition } = useMotionPrefs();

  async function handleNext() {
    if (step === "review") {
      await confirmBooking();
      return;
    }
    goNext();
  }

  return (
    <ResidentShell
      greeting="Schedule Pickup"
      subtitle="A guided flow for your next pickup, available in one simple journey"
    >
      <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-8">
        {bookingError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {bookingError}
          </div>
        )}
        {step !== "success" && <PickupStepper current={step} />}

        <div className="rounded-[28px] border border-border/80 bg-card p-4 shadow-sm sm:p-6 lg:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants(direction)}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              {step === "slot" && <SlotStep />}
              {step === "garments" && <GarmentStep />}
              {step === "other-clothes" && <OtherClothesStep />}
              {step === "addons" && <AddonsStep />}
              {step === "review" && <SummaryStep />}
              {step === "success" && <SuccessStep />}
            </motion.div>
          </AnimatePresence>
        </div>

        {step === "review" && (
          <BookingSummary
            step={step}
            selectedSlot={selectedSlot}
            garments={garments}
            selectedServiceIds={selectedServiceIds}
            instructions={instructions}
            garmentOptions={garmentOptions}
            serviceOptions={serviceOptions}
            taxRate={taxRate}
            deliveryFee={deliveryFee}
            className="w-full"
          />
        )}

        <StepNavigation
          step={step}
          canContinue={canContinue}
          submitting={submitting}
          onBack={goBack}
          onNext={handleNext}
          className="w-full"
        />
      </div>
    </ResidentShell>
  );
}

export default function PickupPage() {
  return (
    <PickupProvider>
      <PickupFlow />
    </PickupProvider>
  );
}
