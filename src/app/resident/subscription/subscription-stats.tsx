"use client";

import { Shirt, Sparkles, Wallet, Droplets, Leaf } from "lucide-react";
import { StatCard } from "./components/stat-card";
import { useSubscription } from "./subscription-provider";

export function SubscriptionStats() {
  const { usageStats } = useSubscription();
  if (!usageStats) return null;

  const stats = [
    { id: "used", title: "Garments Used", value: String(usageStats.garmentsUsed), subtitle: `of ${usageStats.garmentCap}`, icon: <Shirt className="h-5 w-5" /> },
    { id: "remaining", title: "Garments Left", value: String(usageStats.garmentsLeft), subtitle: "remaining", icon: <Sparkles className="h-5 w-5" /> },
    { id: "saved", title: "Amount Saved", value: `₹${usageStats.amountSaved}`, subtitle: "this month", icon: <Wallet className="h-5 w-5" /> },
    { id: "water", title: "Water Saved", value: `${usageStats.waterSavedLiters} L`, subtitle: "this month", icon: <Droplets className="h-5 w-5" /> },
    { id: "carbon", title: "Carbon Reduced", value: `${usageStats.carbonReducedKg} kg`, subtitle: "this month", icon: <Leaf className="h-5 w-5" /> },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
        />
      ))}
    </section>
  );
}
