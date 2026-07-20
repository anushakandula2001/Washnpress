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
      subtitle="A premium, guided booking experience for doorstep laundry"
    >
      <div className="space-y-6 pb-28 lg:pb-8">
        {bookingError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {bookingError}
          </div>
        )}
        {step !== "success" && <PickupStepper current={step} />}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.85fr)] lg:items-start">
          <div className="min-w-0 space-y-6">
            <div
              className={
                step === "success"
                  ? "min-w-0"
                  : "rounded-[24px] border border-border/80 bg-card p-5 shadow-sm md:p-8"
              }
            >
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
                  {step === "addons" && <AddonsStep />}
                  {step === "review" && <SummaryStep />}
                  {step === "success" && <SuccessStep />}
                </motion.div>
              </AnimatePresence>
            </div>

            <StepNavigation
              step={step}
              canContinue={canContinue}
              submitting={submitting}
              onBack={goBack}
              onNext={handleNext}
              className="hidden lg:flex"
            />
          </div>

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
            className="hidden lg:block"
          />
        </div>

        {/* Mobile summary (collapses above sticky CTA) */}
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
          className="lg:hidden"
        />

        <StepNavigation
          step={step}
          canContinue={canContinue}
          submitting={submitting}
          onBack={goBack}
          onNext={handleNext}
          className="lg:hidden"
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
