"use client";

import { OperationsShell } from "@/components/operations/OperationsShell";
import {
  WelcomeSection,
  SummaryCards,
  TodaysPickupsPreview,
  TodaysDeliveriesPreview,
  QuickActionsGrid,
  RecentActivities,
  NotificationsPanel,
  OperationsRightSidebar,
} from "./components";

export default function OperationsDashboardPage() {
  return (
    <OperationsShell>
      <div className="flex flex-col xl:flex-row gap-6 max-w-full">
        {/* Main Content Column */}
        <div className="flex-1 min-w-0 space-y-8 pb-12">
          <WelcomeSection />
          <SummaryCards />
          <QuickActionsGrid />

          <div className="grid lg:grid-cols-2 gap-8">
            <TodaysPickupsPreview />
            <TodaysDeliveriesPreview />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <RecentActivities />
            <NotificationsPanel />
          </div>
        </div>

        {/* Right Sidebar (sticky on xl+) */}
        <div className="w-full xl:w-72 shrink-0">
          <div className="xl:sticky xl:top-[5rem]">
            <OperationsRightSidebar />
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}
