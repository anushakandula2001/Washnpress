"use client";

import { useState, type ComponentType } from "react";
import {
  Shirt,
  Footprints,
  Sparkles,
  Zap,
  Droplets,
  Check,
} from "lucide-react";
import { ResidentShell } from "@/components/resident/resident-shell";
import { useResident } from "@/components/resident/resident-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addonServices } from "@/lib/resident-data";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  shirt: Shirt,
  footprints: Footprints,
  sparkles: Sparkles,
  zap: Zap,
  droplets: Droplets,
};

export default function AddonsPage() {
  const { balance } = useResident();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);

  const total = addonServices
    .filter((a) => selected.has(a.id))
    .reduce((sum, a) => sum + a.priceInr, 0);

  function toggleAddon(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setAdded(false);
  }

  function handleAddToOrder() {
    if (selected.size > 0) setAdded(true);
  }

  return (
    <ResidentShell greeting="Add-on Services" subtitle="Enhance your laundry experience">
      {added ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">Add-ons Added!</h2>
            <p className="mt-2 text-muted-foreground">
              {selected.size} service(s) will be applied to your next pickup.
            </p>
            <p className="text-sm font-medium text-primary">Total: ₹{total}</p>
            <Button className="mt-4" onClick={() => { setAdded(false); setSelected(new Set()); }}>
              Add More Services
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addonServices.map((addon) => {
              const Icon = iconMap[addon.icon] ?? Sparkles;
              const isSelected = selected.has(addon.id);
              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`rounded-xl border p-5 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    {isSelected && <Badge variant="success">Selected</Badge>}
                  </div>
                  <p className="mt-3 font-semibold">{addon.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{addon.description}</p>
                  <p className="mt-2 text-sm font-bold text-primary">₹{addon.priceInr}</p>
                </button>
              );
            })}
          </div>

          {selected.size > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Wallet balance: ₹{balance.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{selected.size} service(s) selected</p>
                  <p className="text-xl font-bold">₹{total}</p>
                </div>
                <Button onClick={handleAddToOrder}>Add to Next Pickup</Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </ResidentShell>
  );
}
