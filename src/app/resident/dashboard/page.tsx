"use client";

import React from "react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import {
  WelcomeSection,
  SummaryCards,
  BookPickupCard,
  CurrentOrderTracking,
  UpcomingPickups,
  WalletMiniCard,
  SubscriptionMiniCard,
  OffersCarousel,
  ResidentFooter,
} from "./components";

export default function ResidentDashboardPage() {
  const { profile, loading } = useResident();
  const displayName = profile?.name ?? "Resident";

  return (
    <ResidentShell
      greeting={`Welcome back, ${displayName}`}
      subtitle={
        loading
          ? "Loading your laundry hub…"
          : "Everything you need for your next laundry run is right here."
      }
    >
      <div className="flex flex-col xl:flex-row gap-6 max-w-full">
        <div className="flex-1 min-w-0 space-y-6">
          <WelcomeSection name={displayName} />
          <SummaryCards />

          <div className="grid gap-6 lg:grid-cols-2">
            <BookPickupCard />
            <OffersCarousel />
          </div>

          <CurrentOrderTracking />
        </div>

        {/* Right Sidebar Column (Hidden on smaller screens, collapses to bottom on tablet) */}
        <div className="w-full xl:w-80 shrink-0 space-y-6">
          <div className="xl:sticky xl:top-[5.5rem] space-y-6">
            <UpcomingPickups />
            
            <div className="grid grid-cols-2 xl:grid-cols-1 gap-6">
              <SubscriptionMiniCard />
              <WalletMiniCard />
            </div>
            
            <RecentActivities />
          </div>
        </div>
      </div>
      
      <ResidentFooter />
    </ResidentShell>
  );
}
