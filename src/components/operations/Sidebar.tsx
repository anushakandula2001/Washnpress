"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Users,
  Building2,
  Headset,
  Settings,
  BarChart,
  PackageCheck,
  CalendarCheck,
  Activity,
  Layers,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navigation = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/operations/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Pickups",
    items: [
      { name: "Pickup Slots", href: "/operations/pickup-slots", icon: CalendarCheck },
      { name: "Today's Pickups", href: "/operations/pickups", icon: Truck },
    ],
  },
  {
    title: "Processing",
    items: [
      { name: "Processing Center", href: "/operations/processing-center", icon: Layers },
    ],
  },
  {
    title: "Delivery",
    items: [
      { name: "Delivery", href: "/operations/delivery", icon: PackageCheck },
      { name: "Delivered Orders", href: "/operations/delivered-orders", icon: Activity },
    ],
  },
  {
    title: "People",
    items: [
      { name: "Residents", href: "/operations/customers", icon: Users },
      { name: "Societies", href: "/operations/master-data", icon: Building2 }, // Assuming master-data for now
      { name: "Assigned Societies", href: "/operations/assigned-societies", icon: Building2 },
    ],
  },
  {
    title: "Support",
    items: [
      { name: "Support Center", href: "/operations/support-center", icon: Headset },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Reports", href: "/operations/reports", icon: BarChart },
      { name: "Settings", href: "/operations/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white font-bold">
            W
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Wash N Press
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        {navigation.map((group) => (
          <div key={group.title}>
            <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Need Help?</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Contact platform support for operational issues.
          </p>
          <button className="w-full rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            Contact Support
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-500">Redis Connected</span>
          </div>
          <span className="text-xs text-slate-400">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
