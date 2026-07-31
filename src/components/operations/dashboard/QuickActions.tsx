"use client";

import { CalendarPlus, PackagePlus, Layers, Truck, Users, Headset, BarChart, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const ACTIONS = [
  { id: "schedule", label: "Schedule Pickup", icon: CalendarPlus, color: "text-blue-600", bg: "bg-blue-50", hoverBg: "hover:bg-blue-100", border: "border-blue-100", route: "/operations/pickup-slots" },
  { id: "manual", label: "Manual Order", icon: PackagePlus, color: "text-indigo-600", bg: "bg-indigo-50", hoverBg: "hover:bg-indigo-100", border: "border-indigo-100", route: "/operations/pickups" },
  { id: "processing", label: "Processing", icon: Layers, color: "text-purple-600", bg: "bg-purple-50", hoverBg: "hover:bg-purple-100", border: "border-purple-100", route: "/operations/processing-center" },
  { id: "delivery", label: "Delivery Queue", icon: Truck, color: "text-teal-600", bg: "bg-teal-50", hoverBg: "hover:bg-teal-100", border: "border-teal-100", route: "/operations/delivery" },
  { id: "residents", label: "Residents", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", hoverBg: "hover:bg-emerald-100", border: "border-emerald-100", route: "/operations/customers" },
  { id: "support", label: "Support", icon: Headset, color: "text-rose-600", bg: "bg-rose-50", hoverBg: "hover:bg-rose-100", border: "border-rose-100", route: "/operations/support-center" },
  { id: "reports", label: "Analytics", icon: BarChart, color: "text-amber-600", bg: "bg-amber-50", hoverBg: "hover:bg-amber-100", border: "border-amber-100", route: "/operations/reports" },
  { id: "settings", label: "Settings", icon: Settings, color: "text-slate-600", bg: "bg-slate-50", hoverBg: "hover:bg-slate-100", border: "border-slate-200", route: "/operations/settings" },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => router.push(action.route)}
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-transparent p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-slate-200 bg-white"
          >
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl transition-colors border", action.bg, action.color, action.hoverBg, action.border)}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 text-center leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
