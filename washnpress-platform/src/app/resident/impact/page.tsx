"use client";

import { useEffect, useState } from "react";
import { Leaf, Droplets, TreePine, Shirt } from "lucide-react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/frontend/api-client";

export default function ImpactPage() {
  const [impact, setImpact] = useState({
    waterSavedLiters: 0,
    co2ReducedKg: 0,
    garmentsProcessed: 0,
    treesEquivalent: 0,
  });

  useEffect(() => {
    void api.sustainability()
      .then((data) => {
        const water = Number(data.totalSavedLiters ?? 0);
        const garments = Number(data.totalGarments ?? 0);
        setImpact({
          waterSavedLiters: water,
          co2ReducedKg: Math.round(water * 0.002 * 10) / 10,
          garmentsProcessed: garments,
          treesEquivalent: Math.round(water / 500),
        });
      })
      .catch(() => undefined);
  }, []);

  const stats = [
    {
      label: "Water Saved",
      value: `${impact.waterSavedLiters.toLocaleString()} L`,
      icon: Droplets,
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "CO₂ Reduced",
      value: `${impact.co2ReducedKg} kg`,
      icon: Leaf,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Garments Processed",
      value: impact.garmentsProcessed.toString(),
      icon: Shirt,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Trees Equivalent",
      value: impact.treesEquivalent.toString(),
      icon: TreePine,
      color: "text-green-700 bg-green-500/10",
    },
  ];

  return (
    <ResidentShell greeting="Your Impact" subtitle="See how your choices make a difference">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ResidentShell>
  );
}
