"use client";

import { Leaf, Droplets, TreePine, Shirt } from "lucide-react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { residentImpact } from "@/lib/resident-data";
import { sustainabilityImpact } from "@/lib/experience-data";

export default function ImpactPage() {
  const stats = [
    {
      label: "Water Saved",
      value: `${residentImpact.waterSavedLiters.toLocaleString()} L`,
      icon: Droplets,
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "CO₂ Reduced",
      value: `${residentImpact.co2ReducedKg} kg`,
      icon: Leaf,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Garments Processed",
      value: residentImpact.garmentsProcessed.toString(),
      icon: Shirt,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Trees Equivalent",
      value: residentImpact.treesEquivalent.toString(),
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
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Community Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {sustainabilityImpact.monthLitersSaved.toLocaleString()} L
              </p>
              <p className="text-sm text-muted-foreground">Water saved this month (network)</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {sustainabilityImpact.treesEquivalent}
              </p>
              <p className="text-sm text-muted-foreground">Trees equivalent saved</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {sustainabilityImpact.carbonReductionKg.toLocaleString()} kg
              </p>
              <p className="text-sm text-muted-foreground">Carbon reduced (network)</p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Every garment you wash with Wash N Press saves up to 8 liters of water compared to home washing.
          </p>
        </CardContent>
      </Card>
    </ResidentShell>
  );
}
