"use client";

import { Truck, RotateCw, Factory, PackageCheck, CheckCircle2, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type KpiData = {
  todayPickups: number;
  pendingPickups: number;
  processing: number;
  readyForDelivery: number;
  deliveredToday: number;
  revenueToday: number;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function KpiCards({ data }: { data: KpiData }) {
  const cards = [
    {
      title: "Today's Pickups",
      value: data.todayPickups,
      subtitle: "Scheduled for today",
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Pending Pickups",
      value: data.pendingPickups,
      subtitle: "Waiting for pickup",
      icon: RotateCw,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      trend: "-2%",
      trendUp: false,
    },
    {
      title: "Orders In Processing",
      value: data.processing,
      subtitle: "Active at plant",
      icon: Factory,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Ready for Delivery",
      value: data.readyForDelivery,
      subtitle: "Packed & waiting",
      icon: PackageCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Delivered Today",
      value: data.deliveredToday,
      subtitle: "Successfully delivered",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      trend: "+24%",
      trendUp: true,
    },
    {
      title: "Revenue Today",
      value: formatCurrency(data.revenueToday),
      subtitle: "Completed paid orders",
      icon: IndianRupee,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
      trend: "+18%",
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
        >
          {/* Glassmorphism accent */}
          <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity", card.bgColor)} />

          <div className="flex justify-between items-start mb-4">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", card.bgColor, card.color)}>
              <card.icon className="h-6 w-6" />
            </div>
            <div className={cn("flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold", card.trendUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
              {card.trend}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">{card.title}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">{card.value}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
