"use client";

import React from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { adminNav } from "@/lib/portal-nav";
import {
  WelcomeSection,
  KpiGrid,
  TodaysPickups,
  TodaysDeliveries,
  RecentOrders,
  PendingTasks,
  RecentResidents,
  RecentPayments,
  QuickActionsGrid,
  SystemNotifications,
  SystemHealth,
  RightSidebar,
} from "./components";

export default function AdminDashboardPage() {
  return (
    <PortalShell
      navItems={adminNav}
      portalLabel="Admin Portal"
    >
      <div className="flex gap-6 max-w-full">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-6 pb-12">
          
          <WelcomeSection />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground px-1">Overview</h3>
            <KpiGrid />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground px-1">Quick Actions</h3>
            <QuickActionsGrid />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <TodaysPickups />
            <TodaysDeliveries />
          </div>

          <PendingTasks />

          <RecentOrders />

          <div className="grid lg:grid-cols-2 gap-6">
            <RecentResidents />
            <RecentPayments />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <SystemNotifications />
            <SystemHealth />
          </div>
          
        </div>

        {/* Right Sidebar Area (Hidden on smaller screens) */}
        <div className="w-80 hidden xl:block shrink-0">
          <div className="sticky top-[5.5rem]">
            <RightSidebar />
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
